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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-hero py-12 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Welcome back, {profile?.name || 'there'}!
            </h1>
            <p className="text-lg opacity-90">
              Your AI-powered assistant for discovering and applying to grants
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Answers Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.ready}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-status-success">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Grants */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recommended Grants</h2>
              <p className="text-sm text-muted-foreground">Based on your business profile</p>
            </div>
            <Link to="/grants">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recommendedGrants.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedGrants.map((grant) => (
                <Link key={grant.id} to={`/grants/${grant.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-royal">
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <Badge variant="secondary">{grant.sponsor_type || 'Grant'}</Badge>
                      </div>
                      <CardTitle className="text-lg">{grant.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {grant.short_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">
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
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">No grants available yet</p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/grants">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Browse All Grants</CardTitle>
                    <CardDescription>Explore available opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/my-applications">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>Continue where you left off</CardDescription>
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
