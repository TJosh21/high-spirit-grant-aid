import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ClipboardList, 
  Sparkles, 
  User, 
  BookmarkCheck,
  Send,
  Trophy,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import { LoadingScreen } from '@/components/LoadingScreen';

interface DashboardStats {
  savedGrants: number;
  appliedGrants: number;
  awardedGrants: number;
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    deadline: string;
  }>;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    savedGrants: 0,
    appliedGrants: 0,
    awardedGrants: 0,
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user?.id)
        .single();
      
      setProfile(profileData);

      // Load user grants stats
      const { data: userGrants } = await supabase
        .from('user_grants')
        .select('status, grant_id, grants(id, name, deadline)')
        .eq('user_id', user?.id);

      if (userGrants) {
        const saved = userGrants.filter(g => g.status === 'saved' || g.status === 'planning').length;
        const applied = userGrants.filter(g => g.status === 'applied').length;
        const awarded = userGrants.filter(g => g.status === 'awarded').length;

        // Get upcoming deadlines from tracked grants
        const upcomingDeadlines = userGrants
          .filter(g => g.grants && (g.grants as any).deadline)
          .map(g => ({
            id: (g.grants as any).id,
            name: (g.grants as any).name,
            deadline: (g.grants as any).deadline
          }))
          .filter(g => new Date(g.deadline) >= new Date())
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 3);

        setStats({
          savedGrants: saved,
          appliedGrants: applied,
          awardedGrants: awarded,
          upcomingDeadlines
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const firstName = profile?.name?.split(' ')[0] || 'there';

  const quickActions = [
    { 
      icon: Search, 
      label: 'Browse Grants', 
      caption: 'Find new funding opportunities',
      path: '/grants'
    },
    { 
      icon: ClipboardList, 
      label: 'My Grants', 
      caption: 'Track your applications',
      path: '/my-grants'
    },
    { 
      icon: Sparkles, 
      label: 'AI Coach', 
      caption: 'Polish your answers',
      path: '/ai-coach'
    },
    { 
      icon: User, 
      label: 'Profile', 
      caption: 'Update your business info',
      path: '/profile'
    },
  ];

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Hero Welcome Card */}
        <Card className="overflow-hidden border-0 shadow-premium">
          <div 
            className="p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #041D4A 0%, #0C3275 100%)'
            }}
          >
            <Badge className="bg-white/20 text-white border-0 mb-4 text-xs font-medium">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Grant Assistant
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, <span className="font-extrabold">{firstName}</span>!
            </h1>
            <p className="text-white/80 text-base">
              Here's your grant activity overview
            </p>
          </div>
        </Card>

        {/* Stats Cards - Horizontal Layout */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card className="hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 flex-shrink-0">
                  <BookmarkCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stats.savedGrants}</div>
                  <p className="text-xs md:text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 flex-shrink-0">
                  <Send className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stats.appliedGrants}</div>
                  <p className="text-xs md:text-sm text-muted-foreground">Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 flex-shrink-0">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stats.awardedGrants}</div>
                  <p className="text-xs md:text-sm text-muted-foreground">Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - 2x2 Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="h-full hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <action.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary mb-1">{action.label}</h3>
                        <p className="text-sm text-muted-foreground">{action.caption}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {stats.upcomingDeadlines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.upcomingDeadlines.map((grant) => {
                const daysLeft = Math.ceil(
                  (new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Link key={grant.id} to={`/grants/${grant.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{grant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grant.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={daysLeft <= 7 ? "destructive" : "gold"}
                        className="ml-2"
                      >
                        {daysLeft} days
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* CTA Banner */}
        {stats.savedGrants === 0 && (
          <Card className="overflow-hidden border-0 shadow-premium">
            <div 
              className="p-8 md:p-10 text-center"
              style={{
                background: 'linear-gradient(135deg, #041D4A 0%, #0C3275 100%)'
              }}
            >
              <h3 className="font-bold text-xl md:text-2xl text-white mb-3">
                Start Your Grant Journey
              </h3>
              <p className="text-white/80 text-base mb-6 max-w-md mx-auto">
                Browse our database of grants and find opportunities that match your business.
              </p>
              <Link to="/grants">
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent-hover text-primary font-semibold px-8 rounded-full gap-2 shadow-lg"
                >
                  Browse Grants
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default UserDashboard;
