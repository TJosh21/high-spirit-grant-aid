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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Available Grants</h1>
          <p className="text-muted-foreground">
            Discover funding opportunities for your business
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search grants by name, description, or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Grants List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredGrants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrants.map((grant) => (
              <Link key={grant.id} to={`/grants/${grant.slug}`}>
                <Card className="h-full transition-all hover:shadow-royal">
                  <CardHeader>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {grant.target_audience_tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {grant.status === 'open' && (
                        <Badge className="bg-status-success text-xs text-white">Open</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">{grant.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {grant.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold text-accent">
                          {grant.amount_min && grant.amount_max
                            ? `$${grant.amount_min.toLocaleString()} - $${grant.amount_max.toLocaleString()}`
                            : 'Varies'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sponsor:</span>
                        <span className="font-medium">{grant.sponsor_name}</span>
                      </div>
                      {grant.deadline && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {new Date(grant.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {grant.application_link && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a
                          href={grant.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          External Link
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery ? 'No grants found matching your search' : 'No grants available'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
