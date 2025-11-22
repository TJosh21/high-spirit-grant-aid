import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ExternalLink } from 'lucide-react';

export default function Grants() {
  const [grants, setGrants] = useState<any[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrants();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = grants.filter(
        (grant) =>
          grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGrants(filtered);
    } else {
      setFilteredGrants(grants);
    }
  }, [searchQuery, grants]);

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
          <h1 className="mb-3 text-3xl md:text-4xl font-bold text-primary">Available Grants</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Discover funding opportunities tailored for your business
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search grants by name, description, or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base"
            />
          </div>
          <Button variant="outline" size="lg" className="sm:w-auto">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </Button>
        </div>

        {/* Grants List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
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
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-xl font-semibold text-muted-foreground">
                {searchQuery ? 'No grants found matching your search' : 'No grants available'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
