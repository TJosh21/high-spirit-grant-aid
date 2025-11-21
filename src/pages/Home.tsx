import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, ready: 0 });
  const [recommendedGrants, setRecommendedGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setProfile(profileData);

      // Check if onboarding is not completed
      if (!profileData?.onboarding_completed) {
        window.location.href = '/onboarding';
        return;
      }

      // Load stats
      const { data: answers } = await supabase
        .from('answers')
        .select('status')
        .eq('user_id', user?.id);

      if (answers) {
        setStats({
          total: answers.length,
          ready: answers.filter((a) => a.status === 'ready').length,
        });
      }

      // Load recommended grants (simplified - just show open grants)
      const { data: grants } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'open')
        .limit(3);

      setRecommendedGrants(grants || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-primary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold text-primary-foreground">
              Welcome back, {profile?.name || 'there'}!
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Your AI-powered assistant for discovering and applying to grants
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Stats Cards */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Answers Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">{stats.ready}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Grants */}
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between border-b-2 border-accent pb-4">
            <div>
              <h2 className="text-3xl font-semibold text-primary">Recommended Grants</h2>
              <p className="text-base text-muted-foreground mt-1">Based on your business profile</p>
            </div>
            <Link to="/grants">
              <Button variant="outline" size="lg">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recommendedGrants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedGrants.map((grant) => (
                <Link key={grant.id} to={`/grants/${grant.slug}`}>
                  <Card className="h-full transition-all hover:shadow-premium">
                    <CardHeader>
                      <div className="mb-3 flex items-start justify-between">
                        <Sparkles className="h-6 w-6 text-accent" />
                        <Badge variant="gold">{grant.sponsor_type || 'Grant'}</Badge>
                      </div>
                      <CardTitle className="text-xl">{grant.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-base">
                        {grant.short_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-base">
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <p className="mb-2 text-xl font-semibold">No grants available yet</p>
                <p className="text-base text-muted-foreground">
                  Check back soon for new opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/grants">
            <Card className="transition-all hover:shadow-card-hover">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <TrendingUp className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Browse All Grants</CardTitle>
                    <CardDescription className="text-base">Explore available opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/my-applications">
            <Card className="transition-all hover:shadow-card-hover">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                    <FileText className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">My Applications</CardTitle>
                    <CardDescription className="text-base">Continue where you left off</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
