import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, Calendar, Building2, MapPin, Filter, X, Save, Trash2, GitCompare, Heart, TrendingUp, Sparkles, Search, Loader2 } from "lucide-react";
import { format, isWithinInterval, addDays } from "date-fns";
import { EmptyState } from "@/components/EmptyState";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { GrantComparison } from "@/components/GrantComparison";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateGrantMatchScore, getTopRecommendedGrants } from "@/utils/grantMatching";

interface FilterPreset {
  name: string;
  filters: {
    searchQuery: string;
    deadlineProximity: string;
    minAmount: string;
    maxAmount: string;
    industries: string[];
  };
}

export default function Grants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [deadlineProximity, setDeadlineProximity] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('grantFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState("");
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const { data: grants, isLoading } = useQuery({
    queryKey: ['grants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Load user profile and favorites
  useEffect(() => {
    loadProfile();
    loadFavorites();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grant_favorites')
        .select('grant_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.grant_id) || []));
    } catch (error: any) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (grantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to favorite grants",
          variant: "destructive",
        });
        return;
      }

      const isFavorited = favorites.has(grantId);

      if (isFavorited) {
        const { error } = await supabase
          .from('grant_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('grant_id', grantId);

        if (error) throw error;
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(grantId);
          return newSet;
        });
        toast({
          title: "Removed from favorites",
          description: "Grant has been removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('grant_favorites')
          .insert({ user_id: user.id, grant_id: grantId });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, grantId]));
        toast({
          title: "Added to favorites",
          description: "Grant has been saved to your favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating favorites",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!grants || !profile) return [];
    return getTopRecommendedGrants(grants, profile, 3);
  }, [grants, profile]);

  // Get unique industries from all grants
  const allIndustries = useMemo(() => {
    if (!grants) return [];
    const industries = new Set<string>();
    grants.forEach(grant => {
      grant.industry_tags?.forEach((tag: string) => industries.add(tag));
    });
    return Array.from(industries).sort();
  }, [grants]);

  // Apply filters
  const filteredGrants = useMemo(() => {
    if (!grants) return [];

    let filtered = grants.filter(grant => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.has(grant.id)) return false;

      // Search filter
      const matchesSearch = searchQuery === "" || 
        grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Deadline proximity filter
      let matchesDeadline = true;
      if (deadlineProximity !== "all" && grant.deadline) {
        const deadline = new Date(grant.deadline);
        const today = new Date();
        
        if (deadlineProximity === "7days") {
          matchesDeadline = isWithinInterval(deadline, { start: today, end: addDays(today, 7) });
        } else if (deadlineProximity === "30days") {
          matchesDeadline = isWithinInterval(deadline, { start: today, end: addDays(today, 30) });
        } else if (deadlineProximity === "90days") {
          matchesDeadline = isWithinInterval(deadline, { start: today, end: addDays(today, 90) });
        }
      }

      // Amount filter
      const matchesAmount = 
        (minAmount === "" || (grant.amount_max && grant.amount_max >= parseInt(minAmount))) &&
        (maxAmount === "" || (grant.amount_min && grant.amount_min <= parseInt(maxAmount)));

      // Industry filter
      const matchesIndustry = selectedIndustries.length === 0 ||
        selectedIndustries.some(industry => grant.industry_tags?.includes(industry));

      return matchesSearch && matchesDeadline && matchesAmount && matchesIndustry;
    });

    return filtered;
  }, [grants, searchQuery, deadlineProximity, minAmount, maxAmount, selectedIndustries, showFavoritesOnly, favorites]);

  const saveFilterPreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the filter preset",
        variant: "destructive"
      });
      return;
    }

    const newPreset: FilterPreset = {
      name: presetName,
      filters: {
        searchQuery,
        deadlineProximity,
        minAmount,
        maxAmount,
        industries: selectedIndustries
      }
    };

    const updatedPresets = [...filterPresets, newPreset];
    setFilterPresets(updatedPresets);
    localStorage.setItem('grantFilterPresets', JSON.stringify(updatedPresets));
    setPresetName("");
    
    toast({
      title: "Filter preset saved",
      description: `"${presetName}" has been saved successfully`
    });
  };

  const loadFilterPreset = (preset: FilterPreset) => {
    setSearchQuery(preset.filters.searchQuery);
    setDeadlineProximity(preset.filters.deadlineProximity);
    setMinAmount(preset.filters.minAmount);
    setMaxAmount(preset.filters.maxAmount);
    setSelectedIndustries(preset.filters.industries);
    
    toast({
      title: "Filter preset loaded",
      description: `Loaded "${preset.name}"`
    });
  };

  const deleteFilterPreset = (index: number) => {
    const updatedPresets = filterPresets.filter((_, i) => i !== index);
    setFilterPresets(updatedPresets);
    localStorage.setItem('grantFilterPresets', JSON.stringify(updatedPresets));
    
    toast({
      title: "Filter preset deleted",
      description: "The filter preset has been removed"
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDeadlineProximity("all");
    setMinAmount("");
    setMaxAmount("");
    setSelectedIndustries([]);
    setShowFavoritesOnly(false);
  };

  const activeFilterCount = [
    searchQuery !== "",
    deadlineProximity !== "all",
    minAmount !== "",
    maxAmount !== "",
    selectedIndustries.length > 0,
    showFavoritesOnly
  ].filter(Boolean).length;

  const toggleGrantSelection = (grantId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(grantId) 
        ? prev.filter(id => id !== grantId)
        : prev.length < 3 
          ? [...prev, grantId]
          : prev
    );
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsAiSearching(true);
    setShowAiResults(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-grant-search', {
        body: { 
          query: aiSearchQuery,
          userId: user?.id 
        }
      });

      if (error) throw error;

      setAiSearchResults(data.results || []);
      toast({
        title: "Search complete",
        description: `Found ${data.results?.length || 0} matching grants`,
      });
    } catch (error: any) {
      console.error('AI search error:', error);
      toast({
        title: "Search failed",
        description: error.message || 'Failed to search grants',
        variant: "destructive",
      });
      setAiSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchQuery("");
    setShowAiResults(false);
    setAiSearchResults([]);
  };

  const selectedGrants = filteredGrants.filter(g => selectedForComparison.includes(g.id));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal>
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-3xl -z-10" />
              <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 rounded-2xl border border-primary/10">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Available Grants
                </h1>
                <p className="text-lg text-muted-foreground">
                  Discover funding opportunities for your business 💼✨
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* AI-Powered Search */}
          <ScrollReveal delay={0.1}>
            <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Grant Search
                </CardTitle>
                <CardDescription>
                  Describe what you're looking for in natural language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="E.g., 'grants for women-owned tech startups in California under $50k'"
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAiSearch} 
                    disabled={isAiSearching}
                    className="gap-2"
                  >
                    {isAiSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
                {showAiResults && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {aiSearchResults.length > 0 
                        ? `Found ${aiSearchResults.length} matching grants`
                        : 'No matches found'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAiSearch}
                      className="h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Input
                type="text"
                placeholder="Search grants by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
              {favorites.size > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {favorites.size}
                </Badge>
              )}
            </Button>

            {selectedForComparison.length > 0 && (
              <Button 
                onClick={() => setShowComparison(true)}
                variant="default"
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare ({selectedForComparison.length})
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Deadline Proximity */}
                  <div className="space-y-2">
                    <Label>Deadline Proximity</Label>
                    <Select value={deadlineProximity} onValueChange={setDeadlineProximity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Deadlines</SelectItem>
                        <SelectItem value="7days">Next 7 Days</SelectItem>
                        <SelectItem value="30days">Next 30 Days</SelectItem>
                        <SelectItem value="90days">Next 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Funding Amount Range */}
                  <div className="space-y-2">
                    <Label>Funding Amount Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Industry Categories */}
                  <div className="space-y-2">
                    <Label>Industry Categories</Label>
                    <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                      {allIndustries.map((industry) => (
                        <div key={industry} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={industry}
                            checked={selectedIndustries.includes(industry)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIndustries([...selectedIndustries, industry]);
                              } else {
                                setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={industry} className="text-sm cursor-pointer">
                            {industry}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filter Presets */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Save Current Filters</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Preset name"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                      />
                      <Button onClick={saveFilterPreset} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {filterPresets.length > 0 && (
                    <div className="space-y-2">
                      <Label>Saved Presets</Label>
                      <div className="space-y-2">
                        {filterPresets.map((preset, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 justify-start"
                              onClick={() => loadFilterPreset(preset)}
                            >
                              {preset.name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFilterPreset(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {showFavoritesOnly && (
                <Badge variant="secondary">
                  Favorites Only
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setShowFavoritesOnly(false)} />
                </Badge>
              )}
              {deadlineProximity !== "all" && (
                <Badge variant="secondary">
                  Deadline: {deadlineProximity}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDeadlineProximity("all")} />
                </Badge>
              )}
              {minAmount && (
                <Badge variant="secondary">
                  Min: ${parseInt(minAmount).toLocaleString()}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setMinAmount("")} />
                </Badge>
              )}
              {maxAmount && (
                <Badge variant="secondary">
                  Max: ${parseInt(maxAmount).toLocaleString()}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setMaxAmount("")} />
                </Badge>
              )}
              {selectedIndustries.map((industry) => (
                <Badge key={industry} variant="secondary">
                  {industry}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedIndustries(selectedIndustries.filter(i => i !== industry))} 
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* AI Search Results */}
          {showAiResults && aiSearchResults.length > 0 && (
            <ScrollReveal delay={0.2}>
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">AI Search Results</h2>
                  </div>
                  <Badge variant="outline">
                    {aiSearchResults.length} {aiSearchResults.length === 1 ? 'match' : 'matches'}
                  </Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {aiSearchResults.map((grant) => {
                    return (
                      <GrantCard
                        key={grant.id}
                        grant={grant}
                        matchScore={grant.ai_relevance_score}
                        matchReasons={grant.ai_reasoning ? [grant.ai_reasoning] : []}
                        isFavorited={favorites.has(grant.id)}
                        onFavoriteToggle={() => toggleFavorite(grant.id)}
                        isSelected={selectedForComparison.includes(grant.id)}
                        onToggleSelection={() => toggleGrantSelection(grant.id)}
                        selectionDisabled={!selectedForComparison.includes(grant.id) && selectedForComparison.length >= 3}
                      />
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Recommendations Section */}
          {!isLoading && recommendations.length > 0 && !showFavoritesOnly && activeFilterCount === 0 && !showAiResults && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Recommended for You</h2>
                <Badge variant="secondary" className="bg-gradient-accent">
                  Based on your profile
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((matchScore) => (
                  <GrantCard
                    key={matchScore.grant.id}
                    grant={matchScore.grant}
                    matchScore={matchScore.score}
                    matchReasons={matchScore.matchReasons}
                    isFavorited={favorites.has(matchScore.grant.id)}
                    onFavoriteToggle={() => toggleFavorite(matchScore.grant.id)}
                    isSelected={selectedForComparison.includes(matchScore.grant.id)}
                    onToggleSelection={() => toggleGrantSelection(matchScore.grant.id)}
                    selectionDisabled={!selectedForComparison.includes(matchScore.grant.id) && selectedForComparison.length >= 3}
                  />
                ))}
              </div>
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">All Available Grants</h2>
              </div>
            </div>
          )}

          {/* Grants List */}
          {!showAiResults && (
            <>
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <GrantCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredGrants.length === 0 ? (
                <EmptyState
                  icon={showFavoritesOnly ? Heart : Filter}
                  title={showFavoritesOnly ? "No favorites yet" : "No grants match your filters"}
                  description={showFavoritesOnly ? "Start favoriting grants to see them here" : "Try adjusting your filters to see more results"}
                  actionLabel={showFavoritesOnly ? undefined : "Clear Filters"}
                  onAction={showFavoritesOnly ? undefined : clearAllFilters}
                />
              ) : (
                <ScrollReveal>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Select up to 3 grants to compare side-by-side
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGrants.map((grant) => {
                      const matchScore = profile ? calculateGrantMatchScore(grant, profile) : null;
                      return (
                        <GrantCard
                          key={grant.id}
                          grant={grant}
                          matchScore={matchScore?.score}
                          matchReasons={matchScore?.matchReasons}
                          isFavorited={favorites.has(grant.id)}
                          onFavoriteToggle={() => toggleFavorite(grant.id)}
                          isSelected={selectedForComparison.includes(grant.id)}
                          onToggleSelection={() => toggleGrantSelection(grant.id)}
                          selectionDisabled={!selectedForComparison.includes(grant.id) && selectedForComparison.length >= 3}
                        />
                      );
                    })}
                  </div>
                </ScrollReveal>
              )}
            </>
          )}
        </div>
      </div>

      {showComparison && (
        <GrantComparison
          grants={selectedGrants}
          onRemove={(grantId) => {
            setSelectedForComparison(prev => prev.filter(id => id !== grantId));
          }}
          onClose={() => setShowComparison(false)}
        />
      )}
    </PageTransition>
  );
}

const GrantCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative h-2 bg-gradient-primary" />
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-16 w-full" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

interface GrantCardProps {
  grant: any;
  matchScore?: number;
  matchReasons?: string[];
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
  selectionDisabled: boolean;
}

const GrantCard = ({ grant, matchScore, matchReasons, isFavorited, onFavoriteToggle, isSelected, onToggleSelection, selectionDisabled }: GrantCardProps) => (
  <Card className={`group relative overflow-hidden hover:shadow-premium transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Gradient header bar */}
    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-primary opacity-60 group-hover:opacity-100 transition-opacity" />
    
    {/* Match Score Badge */}
    {matchScore && matchScore >= 70 && (
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-gradient-success text-white border-0 shadow-lg">
          <Sparkles className="w-3 h-3 mr-1" />
          {matchScore}% Match
        </Badge>
      </div>
    )}

    <CardHeader className="relative pb-4 pt-8">
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
          disabled={selectionDisabled}
        />
        <Button
          variant="ghost"
          size="icon"
          className="hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }`}
          />
        </Button>
        <Badge variant="secondary" className="bg-gradient-accent ml-auto">
          {grant.sponsor_type || 'Grant'}
        </Badge>
      </div>
      <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
        {grant.name}
      </CardTitle>
      <CardDescription className="line-clamp-2 text-sm">
        {grant.short_description}
      </CardDescription>
    </CardHeader>

    <CardContent className="relative space-y-4">
      {/* Match Reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {matchReasons.slice(0, 2).map((reason, idx) => (
            <Badge key={idx} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {reason}
            </Badge>
          ))}
        </div>
      )}

      {/* Funding Amount */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-card p-4 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Funding Range</p>
            <p className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              {grant.currency || 'USD'} {grant.amount_min?.toLocaleString()} - {grant.amount_max?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Deadline */}
      {grant.deadline && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Due {format(new Date(grant.deadline), 'MMM dd, yyyy')}</span>
        </div>
      )}

      {/* Location */}
      {grant.geography_tags && grant.geography_tags.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{grant.geography_tags[0]}</span>
        </div>
      )}

      {/* Industry Tags */}
      {grant.industry_tags && grant.industry_tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {grant.industry_tags.slice(0, 2).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {grant.industry_tags.length > 2 && (
            <Badge variant="outline" className="text-xs bg-muted">
              +{grant.industry_tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* View Details Button */}
      <Link to={`/grants/${grant.slug}`}>
        <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all">
          View Details
        </Button>
      </Link>
    </CardContent>
  </Card>
);