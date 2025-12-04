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
    { icon: Search, label: 'Browse Grants', path: '/grants', color: 'bg-primary/10 text-primary' },
    { icon: ClipboardList, label: 'My Grants', path: '/my-grants', color: 'bg-accent/10 text-accent' },
    { icon: Sparkles, label: 'AI Coach', path: '/ai-coach', color: 'bg-status-success/10 text-status-success' },
    { icon: User, label: 'Profile', path: '/profile', color: 'bg-status-info/10 text-status-info' },
  ];

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground text-base">
            Here's your grant activity overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card className="text-center hover:shadow-card-hover">
            <CardContent className="pt-5 pb-4 px-3">
              <div className="flex justify-center mb-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <BookmarkCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">{stats.savedGrants}</div>
              <p className="text-sm text-muted-foreground mt-1">Saved</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-card-hover">
            <CardContent className="pt-5 pb-4 px-3">
              <div className="flex justify-center mb-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Send className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">{stats.appliedGrants}</div>
              <p className="text-sm text-muted-foreground mt-1">Applied</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-card-hover">
            <CardContent className="pt-5 pb-4 px-3">
              <div className="flex justify-center mb-3">
                <div className="p-2 rounded-full bg-status-success/10">
                  <Trophy className="h-6 w-6 text-status-success" />
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">{stats.awardedGrants}</div>
              <p className="text-sm text-muted-foreground mt-1">Awarded</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Button 
                  variant="outline" 
                  className="w-full h-auto py-4 flex flex-col gap-2 hover:shadow-card"
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        {stats.upcomingDeadlines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-status-warning" />
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
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{grant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grant.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={daysLeft <= 7 ? "destructive" : "secondary"}
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

        {/* CTA */}
        {stats.savedGrants === 0 && (
          <Card className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Start Your Grant Journey</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Browse our database of grants and find opportunities that match your business.
              </p>
              <Link to="/grants">
                <Button 
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
                >
                  Browse Grants
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default UserDashboard;
