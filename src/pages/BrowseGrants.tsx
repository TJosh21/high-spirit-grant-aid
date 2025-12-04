import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import { LoadingScreen } from '@/components/LoadingScreen';

interface Grant {
  id: string;
  name: string;
  sponsor_name: string;
  short_description: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  industry_tags: string[];
  geography_tags: string[];
}

const BrowseGrants = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    amountRange: '',
    deadline: ''
  });

  useEffect(() => {
    loadGrants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [grants, searchQuery, filters]);

  const loadGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('id, name, sponsor_name, short_description, amount_min, amount_max, deadline, industry_tags, geography_tags')
        .eq('status', 'open')
        .order('deadline', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...grants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.sponsor_name.toLowerCase().includes(query) ||
        g.short_description?.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (filters.industry) {
      result = result.filter(g => 
        g.industry_tags?.some(tag => tag.toLowerCase().includes(filters.industry.toLowerCase()))
      );
    }

    // Amount filter
    if (filters.amountRange) {
      result = result.filter(g => {
        const max = g.amount_max || 0;
        switch (filters.amountRange) {
          case 'under10k': return max > 0 && max <= 10000;
          case '10k-50k': return max > 10000 && max <= 50000;
          case '50k-plus': return max > 50000;
          default: return true;
        }
      });
    }

    // Deadline filter
    if (filters.deadline) {
      const now = new Date();
      result = result.filter(g => {
        if (!g.deadline) return filters.deadline === 'rolling';
        const deadline = new Date(g.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.deadline) {
          case 'this-month': return daysUntil <= 30;
          case 'this-week': return daysUntil <= 7;
          case 'rolling': return !g.deadline;
          default: return true;
        }
      });
    }

    setFilteredGrants(result);
  };

  const clearFilters = () => {
    setFilters({ industry: '', amountRange: '', deadline: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || filters.industry || filters.amountRange || filters.deadline;

  const formatAmount = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Amount varies';
    if (min && max) return `$${(min/1000).toFixed(0)}k–$${(max/1000).toFixed(0)}k`;
    if (max) return `Up to $${max >= 1000 ? `${(max/1000).toFixed(0)}k` : max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return { label: 'Rolling', color: 'bg-status-success/15 text-status-success' };
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: 'Expired', color: 'bg-destructive/15 text-destructive' };
    if (days <= 7) return { label: `${days} days left`, color: 'bg-destructive/15 text-destructive' };
    if (days <= 14) return { label: `${days} days left`, color: 'bg-accent/20 text-accent-foreground' };
    return { label: `${days} days left`, color: 'bg-status-success/15 text-status-success' };
  };

  if (loading) return <LoadingScreen />;

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-5 md:space-y-6 max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-display">Available Grants</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Curated funding opportunities matched to your business
          </p>
        </div>

        {/* Search Bar - Full Width */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
          <Input
            placeholder="Search grants, keywords, or funders…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-14 h-14 text-base rounded-2xl border-0 bg-card shadow-card hover:shadow-card-hover focus:shadow-premium focus:ring-2 focus:ring-accent/20 transition-all duration-300"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Toggle - Pill Style */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2.5 rounded-full px-6 h-11 border-border/50 hover:bg-card hover:shadow-card transition-all duration-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-0.5 h-5 w-5 rounded-full bg-accent text-primary text-xs flex items-center justify-center font-bold animate-pulse">
                !
              </span>
            )}
          </Button>
          
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary">
                Clear all
              </Button>
            )}
            <span className="text-sm text-muted-foreground font-medium">
              {filteredGrants.length} grant{filteredGrants.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="shadow-card rounded-2xl">
            <CardContent className="pt-5 pb-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-primary">Industry</label>
                <Select value={filters.industry} onValueChange={(v) => setFilters(f => ({ ...f, industry: v }))}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-primary">Amount</label>
                <Select value={filters.amountRange} onValueChange={(v) => setFilters(f => ({ ...f, amountRange: v }))}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Any amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any amount</SelectItem>
                    <SelectItem value="under10k">Under $10,000</SelectItem>
                    <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                    <SelectItem value="50k-plus">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-primary">Deadline</label>
                <Select value={filters.deadline} onValueChange={(v) => setFilters(f => ({ ...f, deadline: v }))}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Any deadline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any deadline</SelectItem>
                    <SelectItem value="this-week">This week</SelectItem>
                    <SelectItem value="this-month">This month</SelectItem>
                    <SelectItem value="rolling">Rolling/Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grants List - Card Style */}
        <div className="space-y-4 md:space-y-5">
          {filteredGrants.map((grant) => {
            const deadlineStatus = getDeadlineStatus(grant.deadline);
            const allTags = [...(grant.industry_tags || []), ...(grant.geography_tags || [])].slice(0, 3);
            
            return (
              <Link key={grant.id} to={`/grants/${grant.id}`}>
                <Card className="hover:shadow-premium hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl shadow-card border-0 group">
                  <CardContent className="p-5 md:p-7 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      {/* Header Row: Amount & Deadline */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-accent text-primary font-bold px-4 py-2 text-sm rounded-full border-0 shadow-sm">
                          {formatAmount(grant.amount_min, grant.amount_max)}
                        </Badge>
                        <Badge className={`${deadlineStatus.color} px-3.5 py-1.5 text-xs font-semibold rounded-full border-0`}>
                          {deadlineStatus.label}
                        </Badge>
                      </div>

                      {/* Title & Sponsor */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg md:text-xl text-primary line-clamp-2 mb-1.5 group-hover:text-primary/90 transition-colors">
                          {grant.name}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">
                          {grant.sponsor_name}
                        </p>
                      </div>

                      {/* Description */}
                      {grant.short_description && (
                        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {grant.short_description}
                        </p>
                      )}

                      {/* Tags & Arrow */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {allTags.map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              className="bg-primary/8 text-primary border-0 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {filteredGrants.length === 0 && (
            <Card className="shadow-card rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-2">No grants found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default BrowseGrants;
