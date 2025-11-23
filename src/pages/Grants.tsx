import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, Calendar, Building2, MapPin, Filter, X, Save, Trash2, GitCompare, Check } from "lucide-react";
import { format, isWithinInterval, addDays } from "date-fns";
import { LoadingScreen } from "@/components/LoadingScreen";
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

    return grants.filter(grant => {
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
  }, [grants, searchQuery, deadlineProximity, minAmount, maxAmount, selectedIndustries]);

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
  };

  const activeFilterCount = [
    searchQuery !== "",
    deadlineProximity !== "all",
    minAmount !== "",
    maxAmount !== "",
    selectedIndustries.length > 0
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

          {/* Search and Filter Bar */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search grants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

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

          {/* Grants List */}
          {isLoading ? (
            <LoadingScreen />
          ) : filteredGrants.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No grants match your filters"
              description="Try adjusting your filters to see more results"
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <ScrollReveal>
              <div className="mb-4 text-sm text-muted-foreground">
                Select up to 3 grants to compare side-by-side
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGrants.map((grant) => (
                  <Card key={grant.id} className={`group relative overflow-hidden hover:shadow-premium transition-all duration-300 ${selectedForComparison.includes(grant.id) ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Checkbox
                          checked={selectedForComparison.includes(grant.id)}
                          onCheckedChange={() => toggleGrantSelection(grant.id)}
                          disabled={!selectedForComparison.includes(grant.id) && selectedForComparison.length >= 3}
                          className="mr-2"
                        />
                        {selectedForComparison.includes(grant.id) && (
                          <Badge className="ml-auto bg-gradient-to-r from-primary to-primary/80 border-0 shadow-md">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent-foreground border-accent/30 font-semibold">
                          {grant.sponsor_type || '🎯 Grant'}
                        </Badge>
                        {grant.deadline && (
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(grant.deadline), 'MMM dd')}
                          </div>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {grant.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {grant.short_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {grant.amount_max && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl blur-sm" />
                            <div className="relative flex items-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 p-3 rounded-xl border border-primary/10">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md">
                                <DollarSign className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium">Funding Amount</span>
                                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                  {grant.currency || 'USD'} {grant.amount_max.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {grant.industry_tags && grant.industry_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {grant.industry_tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge 
                                key={i} 
                                className="bg-gradient-to-r from-secondary to-muted text-foreground border-border/50 hover:from-primary/10 hover:to-accent/10 transition-all duration-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {grant.industry_tags.length > 2 && (
                              <Badge className="bg-muted text-muted-foreground">
                                +{grant.industry_tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        <Button asChild className="w-full group-hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                          <Link to={`/grants/${grant.slug}`}>View Details →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>

        <GrantComparison 
          grants={selectedGrants}
          onRemove={(grantId) => setSelectedForComparison(prev => prev.filter(id => id !== grantId))}
          onClose={() => setShowComparison(false)}
        />
      </div>
    </PageTransition>
  );
}
