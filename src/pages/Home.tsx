import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, FileText, ArrowRight, Target, Zap, Award } from 'lucide-react';
import { getTopRecommendedGrants } from '@/utils/grantMatching';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { ScrollReveal } from '@/components/ScrollReveal';
import { motion } from 'framer-motion';
import { GrantCalendar } from '@/components/GrantCalendar';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, ready: 0 });
  const [recommendedGrants, setRecommendedGrants] = useState<any[]>([]);
  const [allGrants, setAllGrants] = useState<any[]>([]);
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

      if (grants) {
        setAllGrants(grants);
        if (profileData) {
          const recommended = getTopRecommendedGrants(grants, profileData, 3);
          setRecommendedGrants(recommended);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-accent py-16 md:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary-foreground blur-3xl animate-float-up"></div>
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent blur-3xl animate-float-up" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">AI-Powered Grant Assistant</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground font-display leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Welcome back,<br />
              <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
                {profile?.name?.split(' ')[0] || 'there'}!
              </span> 👋
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Your intelligent assistant is ready to help you discover and secure the perfect funding opportunities for your business
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/grants')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-premium gap-2 group"
              >
                <Zap className="h-5 w-5 group-hover:animate-pulse" />
                Explore Grants
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/my-applications')}
                className="bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 gap-2"
              >
                <Award className="h-5 w-5" />
                My Applications
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="mt-12 grid grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground font-display">{stats.total}</div>
                <div className="text-sm text-primary-foreground/70 mt-1">Started</div>
              </div>
              <div className="text-center border-x border-primary-foreground/20">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground font-display">{stats.ready}</div>
                <div className="text-sm text-primary-foreground/70 mt-1">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground font-display">
                  {stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-primary-foreground/70 mt-1">Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Stats Cards */}
        <ScrollReveal>
          <div className="mb-10 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Applications Started', value: stats.total, icon: TrendingUp, color: 'primary', progress: Math.min((stats.total / 10) * 100, 100) },
              { title: 'Ready to Submit', value: stats.ready, icon: Sparkles, color: 'accent', progress: Math.min((stats.ready / 10) * 100, 100) },
              { title: 'Success Rate', value: `${stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%`, icon: Target, color: 'primary', progress: stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0 }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="border-l-4 border-l-${stat.color} shadow-card hover:shadow-premium overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-${stat.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                      {stat.title}
                      <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl md:text-4xl font-bold text-${stat.color} animate-count-up font-display`}>{stat.value}</div>
                    <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full bg-${stat.color} rounded-full animate-shimmer`} style={{ width: `${stat.progress}%` }}></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Grant Calendar */}
        {allGrants.length > 0 && (
          <ScrollReveal delay={0.2}>
            <div className="mb-10">
              <GrantCalendar grants={allGrants} />
            </div>
          </ScrollReveal>
        )}

        {/* Recommended Grants */}
        <ScrollReveal delay={0.3}>
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
            <EmptyState
              icon={FileText}
              title="No grants available yet"
              description="Check back soon for new funding opportunities tailored to your business profile"
              actionLabel="Browse All Grants"
              onAction={() => navigate('/grants')}
            />
          )}
        </div>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.4}>
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
        </ScrollReveal>
      </div>
    </div>
  );
}
