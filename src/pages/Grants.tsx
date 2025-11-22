import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';

export default function Grants() {
  const navigate = useNavigate();
  const [grants, setGrants] = useState<any[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 500000]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadGrants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, grants, selectedCategories, amountRange, selectedBusinessTypes, deadlineFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...grants];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (grant) =>
          grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((grant) =>
        selectedCategories.some(category => 
          grant.industry_tags?.some((tag: string) => tag.toLowerCase().includes(category.toLowerCase())) ||
          grant.target_audience_tags?.some((tag: string) => tag.toLowerCase().includes(category.toLowerCase()))
        )
      );
    }

    // Amount range filter
    filtered = filtered.filter((grant) => {
      if (!grant.amount_min && !grant.amount_max) return true;
      const min = grant.amount_min || 0;
      const max = grant.amount_max || 1000000;
      return min <= amountRange[1] && max >= amountRange[0];
    });

    // Business type filter
    if (selectedBusinessTypes.length > 0) {
      filtered = filtered.filter((grant) =>
        selectedBusinessTypes.some(type =>
          grant.target_audience_tags?.some((tag: string) => tag.toLowerCase().includes(type.toLowerCase()))
        )
      );
    }

    // Deadline filter
    const now = new Date();
    if (deadlineFilter === 'this-month') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filtered = filtered.filter((grant) => {
        if (!grant.deadline) return false;
        const deadline = new Date(grant.deadline);
        return deadline <= endOfMonth && deadline >= now;
      });
    } else if (deadlineFilter === 'next-3-months') {
      const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      filtered = filtered.filter((grant) => {
        if (!grant.deadline) return false;
        const deadline = new Date(grant.deadline);
        return deadline <= threeMonthsLater && deadline >= now;
      });
    } else if (deadlineFilter === 'has-deadline') {
      filtered = filtered.filter((grant) => grant.deadline);
    }

    // Sort
    if (sortBy === 'amount-high') {
      filtered.sort((a, b) => (b.amount_max || 0) - (a.amount_max || 0));
    } else if (sortBy === 'amount-low') {
      filtered.sort((a, b) => (a.amount_min || 0) - (b.amount_min || 0));
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredGrants(filtered);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setAmountRange([0, 500000]);
    setSelectedBusinessTypes([]);
    setDeadlineFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedBusinessTypes.length + 
    (deadlineFilter !== 'all' ? 1 : 0) +
    (amountRange[0] !== 0 || amountRange[1] !== 500000 ? 1 : 0);

  const loadGrants = async () => {
    try {
      const { data } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      setGrants(data || []);
      setFilteredGrants(data || []);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="mb-3 text-3xl md:text-4xl font-bold text-primary font-display">Available Grants</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Discover funding opportunities tailored for your business
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search grants by name, description, or sponsor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-14">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  <SelectItem value="deadline">Deadline Soon</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Grants</SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect funding opportunity
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Categories</Label>
                      <div className="space-y-2">
                        {['Technology', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Agriculture'].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category));
                                }
                              }}
                            />
                            <label htmlFor={category} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Type Filter */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Business Type</Label>
                      <div className="space-y-2">
                        {['Women-Owned', 'Minority-Owned', 'Startup', 'Small Business', 'Veteran-Owned'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={selectedBusinessTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBusinessTypes([...selectedBusinessTypes, type]);
                                } else {
                                  setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={type} className="text-sm cursor-pointer">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Grant Amount Range</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${amountRange[0].toLocaleString()}</span>
                          <span>${amountRange[1].toLocaleString()}</span>
                        </div>
                        <Slider
                          value={amountRange}
                          onValueChange={(value) => setAmountRange(value as [number, number])}
                          max={500000}
                          min={0}
                          step={10000}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Deadline Filter */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Deadline</Label>
                      <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grants</SelectItem>
                          <SelectItem value="this-month">Closing This Month</SelectItem>
                          <SelectItem value="next-3-months">Next 3 Months</SelectItem>
                          <SelectItem value="has-deadline">Has Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        Clear All
                      </Button>
                      <Button onClick={() => setFilterOpen(false)} className="flex-1">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                  />
                </Badge>
              ))}
              {selectedBusinessTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== type))}
                  />
                </Badge>
              ))}
              {deadlineFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {deadlineFilter === 'this-month' ? 'This Month' : deadlineFilter === 'next-3-months' ? 'Next 3 Months' : 'Has Deadline'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setDeadlineFilter('all')}
                  />
                </Badge>
              )}
              {(amountRange[0] !== 0 || amountRange[1] !== 500000) && (
                <Badge variant="secondary" className="gap-1">
                  ${amountRange[0].toLocaleString()} - ${amountRange[1].toLocaleString()}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setAmountRange([0, 500000])}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Grants List */}
        {loading ? (
          <LoadingScreen />
        ) : filteredGrants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrants.map((grant) => (
              <Link key={grant.id} to={`/grants/${grant.slug}`}>
                <Card className="h-full transition-all hover:shadow-premium border-border shadow-card">
                  <CardHeader className="pb-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {grant.target_audience_tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {grant.status === 'open' && (
                        <Badge variant="gold" className="text-xs font-semibold">Open Now</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg md:text-xl mb-2">{grant.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm md:text-base">
                      {grant.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm md:text-base">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold text-accent text-right">
                          {grant.amount_min && grant.amount_max
                            ? `$${grant.amount_min.toLocaleString()} - $${grant.amount_max.toLocaleString()}`
                            : 'Varies'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Sponsor:</span>
                        <span className="font-medium text-right">{grant.sponsor_name}</span>
                      </div>
                      {grant.deadline && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium text-right">
                            {new Date(grant.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={searchQuery ? 'No grants found' : 'No grants available'}
            description={searchQuery ? 'Try adjusting your search terms or filters to find more opportunities' : 'Check back soon for new funding opportunities'}
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        )}
      </div>
    </div>
  );
}
