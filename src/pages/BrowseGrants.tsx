import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { GrantCard } from '@/components/ui/grant-card';
import { GrantsListSkeleton } from '@/components/ui/grant-card-skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';

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
  sponsor_type?: string | null;
}

const BrowseGrants = () => {
  const navigate = useNavigate();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
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
        .select('id, name, sponsor_name, short_description, amount_min, amount_max, deadline, industry_tags, geography_tags, sponsor_type')
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.sponsor_name.toLowerCase().includes(query) ||
        g.short_description?.toLowerCase().includes(query)
      );
    }

    if (filters.industry) {
      result = result.filter(g => 
        g.industry_tags?.some(tag => tag.toLowerCase().includes(filters.industry.toLowerCase()))
      );
    }

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

  // Loading state with skeleton
  if (loading) {
    return (
      <MobileLayout>
        <AppHeader />
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-5 md:space-y-6 max-w-5xl mx-auto">
          <SectionHeader
            title="Available Grants"
            description="Curated funding opportunities matched to your business"
            size="lg"
          />
          <div className="h-14 rounded-full bg-card shadow-card animate-pulse" />
          <div className="h-11 w-32 rounded-full bg-card shadow-card animate-pulse" />
          <GrantsListSkeleton count={6} />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-5 md:space-y-6 max-w-5xl mx-auto">
        {/* Section Header */}
        <SectionHeader
          title="Available Grants"
          description="Curated funding opportunities matched to your business"
          size="lg"
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Search grants, keywords, or funders…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          size="lg"
        />

        {/* Filter Row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2.5 rounded-full px-6 h-11 border-border/50 hover:bg-card hover:shadow-card transition-all duration-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-0.5 h-5 w-5 rounded-full bg-accent text-primary text-xs flex items-center justify-center font-bold">
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
          <Card className="shadow-card rounded-2xl border-border/30 animate-fade-in-up">
            <CardContent className="pt-5 pb-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-primary">Industry</label>
                <Select value={filters.industry} onValueChange={(v) => setFilters(f => ({ ...f, industry: v }))}>
                  <SelectTrigger className="rounded-xl h-11 border-border/50">
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
                  <SelectTrigger className="rounded-xl h-11 border-border/50">
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
                  <SelectTrigger className="rounded-xl h-11 border-border/50">
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

        {/* Grants Grid */}
        {filteredGrants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrants.map((grant) => (
              <GrantCard
                key={grant.id}
                title={grant.name}
                funder={grant.sponsor_name}
                amountMin={grant.amount_min}
                amountMax={grant.amount_max}
                deadline={grant.deadline}
                category={grant.sponsor_type}
                tags={[...(grant.industry_tags || []), ...(grant.geography_tags || [])]}
                onClick={() => navigate(`/grants/${grant.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No grants found"
            description="Try adjusting your search or filters to find more opportunities"
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default BrowseGrants;
