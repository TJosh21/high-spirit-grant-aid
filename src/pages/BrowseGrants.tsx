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
  Calendar, 
  DollarSign,
  Building2,
  ChevronRight,
  X
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
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) return <LoadingScreen />;

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select value={filters.industry} onValueChange={(v) => setFilters(f => ({ ...f, industry: v }))}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <Select value={filters.amountRange} onValueChange={(v) => setFilters(f => ({ ...f, amountRange: v }))}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-2 block">Deadline</label>
                <Select value={filters.deadline} onValueChange={(v) => setFilters(f => ({ ...f, deadline: v }))}>
                  <SelectTrigger>
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

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          {filteredGrants.length} grant{filteredGrants.length !== 1 ? 's' : ''} found
        </p>

        {/* Grants List */}
        <div className="space-y-3">
          {filteredGrants.map((grant) => {
            const daysLeft = getDaysUntilDeadline(grant.deadline);
            
            return (
              <Link key={grant.id} to={`/grants/${grant.id}`}>
                <Card className="hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {grant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {grant.sponsor_name}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    {grant.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {grant.short_description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatAmount(grant.amount_min, grant.amount_max)}
                      </Badge>
                      
                      {daysLeft !== null && (
                        <Badge 
                          variant={daysLeft <= 7 ? "destructive" : daysLeft <= 14 ? "outline" : "secondary"}
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}
                        </Badge>
                      )}
                      
                      {!grant.deadline && (
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Rolling
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {filteredGrants.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No grants found</h3>
                <p className="text-sm text-muted-foreground">
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
