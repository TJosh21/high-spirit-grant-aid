import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, FileText, ArrowRight, Target, Zap, Award, User, BookOpen, Bookmark, CheckCircle2 } from 'lucide-react';
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
  const [stats, setStats] = useState({ saved: 0, applied: 0, awarded: 0 });
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

      // Load user grants for stats
      const { data: userGrants } = await supabase
        .from('user_grants')
        .select('status')
        .eq('user_id', user?.id);

      if (userGrants) {
        setStats({
          saved: userGrants.filter((g) => g.status === 'saved' || g.status === 'planning').length,
          applied: userGrants.filter((g) => g.status === 'applied').length,
          awarded: userGrants.filter((g) => g.status === 'awarded').length,
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

  const quickActions = [
    { 
      title: 'Browse Grants', 
      description: 'Discover new funding opportunities', 
      icon: TrendingUp, 
      href: '/grants',
      color: 'primary'
    },
    { 
      title: 'My Grants', 
      description: 'Track your saved grants', 
      icon: Bookmark, 
      href: '/my-grants',
      color: 'accent'
    },
    { 
      title: 'AI Coach', 
      description: 'Get help with applications', 
      icon: BookOpen, 
      href: '/ai-coach',
      color: 'status-success'
    },
    { 
      title: 'Profile', 
      description: 'Update your business info', 
      icon: User, 
      href: '/profile',
      color: 'status-info'
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Card Section */}
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl mx-auto">
        <ScrollReveal>
          <Card className="overflow-hidden shadow-premium border-0">
            <div 
              className="relative p-6 md:p-10"
              style={{ 
                background: 'linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 80% 25%) 50%, hsl(220 70% 30%) 100%)' 
              }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/10 blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                {/* AI Badge */}
                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-4 px-4 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  AI-Powered Grant Assistant
                </Badge>
                
                {/* Welcome Message */}
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 font-display">
                  Welcome back, {profile?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-white/80 text-base md:text-lg max-w-xl">
                  Your intelligent assistant is ready to help you discover and secure the perfect funding opportunities.
                </p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6">
            {[
              { label: 'Saved', value: stats.saved, icon: Bookmark, color: 'bg-accent' },
              { label: 'Applied', value: stats.applied, icon: FileText, color: 'bg-primary' },
              { label: 'Awarded', value: stats.awarded, icon: Award, color: 'bg-status-success' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-all rounded-2xl">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-primary font-display">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.2}>
          <div className="mt-8">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4 font-display">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                >
                  <Link to={action.href}>
                    <Card className="h-full shadow-card hover:shadow-premium hover:-translate-y-1 transition-all duration-300 rounded-2xl group cursor-pointer">
                      <CardContent className="p-4 md:p-5">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-${action.color}/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                          <action.icon className={`h-6 w-6 md:h-7 md:w-7 text-${action.color}`} />
                        </div>
                        <h3 className="font-semibold text-primary text-sm md:text-base mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Grant Calendar */}
        {allGrants.length > 0 && (
          <ScrollReveal delay={0.3}>
            <div className="mt-8">
              <GrantCalendar grants={allGrants} />
            </div>
          </ScrollReveal>
        )}

        {/* Recommended Grants */}
        <ScrollReveal delay={0.4}>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-primary font-display">Recommended For You</h2>
                <p className="text-sm text-muted-foreground">Funding opportunities matching your profile</p>
              </div>
              <Link to="/grants">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {recommendedGrants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedGrants.map((matchedGrant) => (
                  <Link key={matchedGrant.grant.id} to={`/grants/${matchedGrant.grant.id}`}>
                    <Card className="h-full shadow-card hover:shadow-premium hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-accent text-primary font-semibold px-3 py-1 rounded-full">
                            {matchedGrant.score}% Match
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {matchedGrant.grant.sponsor_type || 'Grant'}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-primary line-clamp-2 mb-1">
                          {matchedGrant.grant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {matchedGrant.grant.sponsor_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-accent text-sm">
                            {matchedGrant.grant.amount_min && matchedGrant.grant.amount_max
                              ? `$${(matchedGrant.grant.amount_min/1000).toFixed(0)}k–$${(matchedGrant.grant.amount_max/1000).toFixed(0)}k`
                              : 'Varies'}
                          </span>
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
                description="Check back soon for new funding opportunities"
                actionLabel="Browse All Grants"
                onAction={() => navigate('/grants')}
              />
            )}
          </div>
        </ScrollReveal>

        {/* CTA Banner */}
        {stats.saved === 0 && (
          <ScrollReveal delay={0.5}>
            <Card className="mt-8 overflow-hidden border-0 shadow-premium">
              <div 
                className="p-6 md:p-8 text-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(43 90% 58%) 0%, hsl(43 95% 65%) 100%)' 
                }}
              >
                <h3 className="text-lg md:text-xl font-bold text-primary mb-2 font-display">
                  Start Your Grant Journey
                </h3>
                <p className="text-primary/80 text-sm md:text-base mb-4">
                  Browse our curated collection of grants matched to your business.
                </p>
                <Button 
                  onClick={() => navigate('/grants')}
                  className="bg-primary text-white hover:bg-primary-hover gap-2"
                >
                  <Target className="h-4 w-4" />
                  Browse Grants
                </Button>
              </div>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
