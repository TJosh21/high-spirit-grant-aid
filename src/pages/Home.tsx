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
          <Card className="overflow-hidden shadow-premium border-0 rounded-3xl">
            <div 
              className="relative p-6 md:p-10 lg:p-12"
              style={{ 
                background: 'linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 85% 20%) 50%, hsl(220 75% 28%) 100%)' 
              }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-accent/10 blur-2xl" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-accent/5 blur-xl" />
              </div>
              
              <div className="relative z-10">
                {/* AI Badge */}
                <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm mb-5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  AI-Powered Grant Assistant
                </Badge>
                
                {/* Welcome Message */}
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-display leading-tight">
                  Welcome back, <span className="text-accent">{profile?.name?.split(' ')[0] || 'there'}</span>! 👋
                </h1>
                <p className="text-white/75 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
                  Your intelligent assistant is ready to help you discover and secure the perfect funding opportunities.
                </p>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 md:gap-5 mt-6 md:mt-8">
            {[
              { label: 'Saved', value: stats.saved, icon: Bookmark, bgColor: 'bg-accent/15', iconBg: 'bg-accent', textColor: 'text-accent' },
              { label: 'Applied', value: stats.applied, icon: FileText, bgColor: 'bg-primary/10', iconBg: 'bg-primary', textColor: 'text-primary' },
              { label: 'Awarded', value: stats.awarded, icon: Award, bgColor: 'bg-status-success/15', iconBg: 'bg-status-success', textColor: 'text-status-success' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="shadow-card hover:shadow-premium transition-all duration-300 rounded-2xl border-0 overflow-hidden group">
                  <CardContent className="p-4 md:p-6 relative">
                    <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                          <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                      <div className={`text-3xl md:text-4xl font-bold ${stat.textColor} font-display`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.2}>
          <div className="mt-8 md:mt-10">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4 md:mb-5 font-display">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                >
                  <Link to={action.href}>
                    <Card className="h-full shadow-card hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 rounded-2xl group cursor-pointer border-0 overflow-hidden">
                      <CardContent className="p-5 md:p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-${action.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className={`h-7 w-7 md:h-8 md:w-8 text-${action.color}`} />
                          </div>
                          <h3 className="font-bold text-primary text-base md:text-lg mb-1.5">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {action.description}
                          </p>
                        </div>
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
            <Card className="mt-8 md:mt-10 overflow-hidden border-0 shadow-premium rounded-3xl">
              <div 
                className="p-8 md:p-10 lg:p-12 text-center relative"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(43 90% 58%) 0%, hsl(43 95% 65%) 50%, hsl(43 90% 60%) 100%)' 
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5 blur-xl" />
                </div>
                <div className="relative">
                  <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 font-display">
                    Start Your Grant Journey
                  </h3>
                  <p className="text-primary/75 text-base md:text-lg mb-6 max-w-md mx-auto">
                    Browse our curated collection of grants matched to your business profile.
                  </p>
                  <Button 
                    onClick={() => navigate('/grants')}
                    size="lg"
                    className="bg-primary text-white hover:bg-primary-hover gap-2 rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Target className="h-5 w-5" />
                    Browse Grants
                  </Button>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
