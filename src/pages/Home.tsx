import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, FileText, ArrowRight, Target } from 'lucide-react';
import { getTopRecommendedGrants } from '@/utils/grantMatching';

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

      // Load all open grants and calculate match scores
      const { data: grants } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'open');

      if (grants && profileData) {
        const recommended = getTopRecommendedGrants(grants, profileData, 3);
        setRecommendedGrants(recommended);
      }
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
      <div className="bg-gradient-to-br from-primary via-primary-hover to-primary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground font-display">
              Welcome back, {profile?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90">
              Your AI-powered grant assistant is ready to help you secure funding for your business
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Stats Cards */}
        <div className="mb-10 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-primary shadow-card hover:shadow-premium overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                Applications Started
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl md:text-4xl font-bold text-primary animate-count-up font-display">{stats.total}</div>
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-shimmer" style={{ width: `${Math.min((stats.total / 10) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent shadow-card hover:shadow-premium overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                Ready to Submit
                <Sparkles className="h-4 w-4 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl md:text-4xl font-bold text-accent animate-count-up font-display">{stats.ready}</div>
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full animate-shimmer" style={{ width: `${Math.min((stats.ready / 10) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary shadow-card hover:shadow-premium sm:col-span-2 lg:col-span-1 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                Success Rate
                <Target className="h-4 w-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl md:text-4xl font-bold text-primary animate-count-up font-display">
                {stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%
              </div>
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Grants */}
        <div className="mb-10">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b-2 border-accent/50">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-1 font-display">Recommended For You</h2>
              <p className="text-sm md:text-base text-muted-foreground">Funding opportunities matching your business profile</p>
            </div>
            <Link to="/grants" className="self-start sm:self-auto">
              <Button variant="outline" size="lg" className="gap-2">
                View All Grants
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recommendedGrants.length > 0 ? (
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedGrants.map((matchedGrant) => (
                <Link key={matchedGrant.grant.id} to={`/grants/${matchedGrant.grant.slug}`}>
                  <Card className="h-full transition-all hover:shadow-premium shadow-card">
                    <CardHeader className="pb-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-accent flex-shrink-0" />
                          <Badge variant="default" className="text-xs font-bold">
                            {matchedGrant.score}% Match
                          </Badge>
                        </div>
                        <Badge variant="gold" className="text-xs">{matchedGrant.grant.sponsor_type || 'Grant'}</Badge>
                      </div>
                      <CardTitle className="text-lg md:text-xl line-clamp-2 mb-2">{matchedGrant.grant.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm md:text-base">
                        {matchedGrant.grant.short_description}
                      </CardDescription>
                      {matchedGrant.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {matchedGrant.matchReasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm md:text-base">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-accent text-right">
                            {matchedGrant.grant.amount_min && matchedGrant.grant.amount_max
                              ? `$${matchedGrant.grant.amount_min.toLocaleString()} - $${matchedGrant.grant.amount_max.toLocaleString()}`
                              : 'Varies'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Sponsor:</span>
                          <span className="font-medium text-right line-clamp-1">{matchedGrant.grant.sponsor_name}</span>
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
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
          <Link to="/grants">
            <Card className="transition-all hover:shadow-card-hover shadow-card h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg md:text-xl mb-1">Browse All Grants</CardTitle>
                    <CardDescription className="text-sm md:text-base">Discover new funding opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/my-applications">
            <Card className="transition-all hover:shadow-card-hover shadow-card h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-accent/10 flex-shrink-0">
                    <FileText className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg md:text-xl mb-1">My Applications</CardTitle>
                    <CardDescription className="text-sm md:text-base">Continue your submissions</CardDescription>
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
