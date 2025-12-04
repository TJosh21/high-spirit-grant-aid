import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroCard } from '@/components/ui/hero-card';
import { StatCard } from '@/components/ui/stat-card';
import { ActionCard } from '@/components/ui/action-card';
import { SectionHeader } from '@/components/ui/section-header';
import { CTABanner } from '@/components/ui/cta-banner';
import { GrantCard } from '@/components/ui/grant-card';
import { Skeleton, SkeletonCard, SkeletonStat } from '@/components/ui/skeleton';
import { 
  Sparkles, TrendingUp, FileText, ArrowRight, Target, 
  Award, User, BookOpen, Bookmark
} from 'lucide-react';
import { getTopRecommendedGrants } from '@/utils/grantMatching';
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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setProfile(profileData);

      if (!profileData?.onboarding_completed) {
        window.location.href = '/onboarding';
        return;
      }

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navigation />
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl mx-auto">
          {/* Hero skeleton */}
          <Skeleton className="h-48 md:h-56 rounded-3xl mb-6 md:mb-8" />
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
          
          {/* Quick actions skeleton */}
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3 md:gap-5 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { 
      title: 'Browse Grants', 
      description: 'Discover new funding opportunities', 
      icon: TrendingUp, 
      href: '/grants',
      iconColor: 'text-primary',
      iconBgColor: 'bg-primary/10'
    },
    { 
      title: 'My Grants', 
      description: 'Track your saved grants', 
      icon: Bookmark, 
      href: '/my-grants',
      iconColor: 'text-accent',
      iconBgColor: 'bg-accent/15'
    },
    { 
      title: 'AI Coach', 
      description: 'Get help with applications', 
      icon: BookOpen, 
      href: '/ai-coach',
      iconColor: 'text-status-success',
      iconBgColor: 'bg-status-success/15'
    },
    { 
      title: 'Profile', 
      description: 'Update your business info', 
      icon: User, 
      href: '/profile',
      iconColor: 'text-status-info',
      iconBgColor: 'bg-status-info/15'
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl mx-auto">
        {/* Hero Card */}
        <ScrollReveal>
          <HeroCard
            badge="AI-Powered Grant Assistant"
            title={
              <>
                Welcome back, <span className="text-accent">{profile?.name?.split(' ')[0] || 'there'}</span>! 👋
              </>
            }
            subtitle="Your intelligent assistant is ready to help you discover and secure the perfect funding opportunities."
            variant="primary"
          />
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 md:gap-5 mt-6 md:mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.4 }}
            >
              <StatCard
                label="Saved"
                value={stats.saved}
                icon={Bookmark}
                tone="accent"
                variant="elevated"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <StatCard
                label="Applied"
                value={stats.applied}
                icon={FileText}
                tone="default"
                variant="elevated"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <StatCard
                label="Awarded"
                value={stats.awarded}
                icon={Award}
                tone="success"
                variant="elevated"
              />
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.2}>
          <div className="mt-8 md:mt-10">
            <SectionHeader title="Quick Actions" size="md" />
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                >
                  <Link to={action.href}>
                    <ActionCard
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      iconColor={action.iconColor}
                      iconBgColor={action.iconBgColor}
                    />
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
            <SectionHeader
              title="Recommended For You"
              description="Funding opportunities matching your profile"
              action={{ label: "View All", onClick: () => navigate('/grants') }}
            />

            {recommendedGrants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedGrants.map((matchedGrant) => (
                  <GrantCard
                    key={matchedGrant.grant.id}
                    title={matchedGrant.grant.name}
                    funder={matchedGrant.grant.sponsor_name}
                    amountMin={matchedGrant.grant.amount_min}
                    amountMax={matchedGrant.grant.amount_max}
                    deadline={matchedGrant.grant.deadline}
                    category={matchedGrant.grant.sponsor_type}
                    matchScore={matchedGrant.score}
                    tags={matchedGrant.grant.industry_tags || []}
                    onClick={() => navigate(`/grants/${matchedGrant.grant.id}`)}
                  />
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
            <div className="mt-8 md:mt-10">
              <CTABanner
                title="Start Your Grant Journey"
                description="Browse our curated collection of grants matched to your business profile."
                buttonLabel="Browse Grants"
                buttonIcon={Target}
                onAction={() => navigate('/grants')}
                variant="accent"
              />
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
