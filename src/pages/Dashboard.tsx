import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Calendar,
  Award
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type MetricsData = {
  totalApplications: number;
  completedApplications: number;
  inProgressApplications: number;
  successRate: number;
  upcomingDeadlines: Array<{
    grantName: string;
    deadline: string;
    daysLeft: number;
    slug: string;
  }>;
  recentActivity: Array<{
    grantName: string;
    status: string;
    updatedAt: string;
    slug: string;
  }>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData>({
    totalApplications: 0,
    completedApplications: 0,
    inProgressApplications: 0,
    successRate: 0,
    upcomingDeadlines: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardMetrics();
    }
  }, [user]);

  const loadDashboardMetrics = async () => {
    try {
      // Get all user's answers
      const { data: answers } = await supabase
        .from('answers')
        .select('*, grants(*)')
        .eq('user_id', user?.id)
        .order('last_updated_at', { ascending: false });

      if (!answers) return;

      // Group by grant to count applications
      const grantMap = new Map();
      answers.forEach((answer: any) => {
        if (!grantMap.has(answer.grant_id)) {
          grantMap.set(answer.grant_id, {
            grant: answer.grants,
            answers: [],
          });
        }
        grantMap.get(answer.grant_id).answers.push(answer);
      });

      const totalApps = grantMap.size;
      const completedApps = Array.from(grantMap.values()).filter(
        (app: any) => app.answers.every((a: any) => a.status === 'ready')
      ).length;
      const inProgressApps = totalApps - completedApps;

      // Calculate success rate (based on completed applications with positive outcomes)
      const successfulApps = Array.from(grantMap.values()).filter(
        (app: any) => app.answers.some((a: any) => a.outcome === 'approved')
      ).length;
      const successRate = totalApps > 0 ? (successfulApps / totalApps) * 100 : 0;

      // Get upcoming deadlines
      const upcomingDeadlines = Array.from(grantMap.values())
        .map((app: any) => ({
          grantName: app.grant.name,
          deadline: app.grant.deadline,
          slug: app.grant.slug,
          daysLeft: app.grant.deadline
            ? differenceInDays(parseISO(app.grant.deadline), new Date())
            : null,
        }))
        .filter((item) => item.daysLeft !== null && item.daysLeft >= 0)
        .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
        .slice(0, 5);

      // Get recent activity
      const recentActivity = answers
        .slice(0, 5)
        .map((answer: any) => ({
          grantName: answer.grants.name,
          status: answer.status,
          updatedAt: answer.last_updated_at,
          slug: answer.grants.slug,
        }));

      setMetrics({
        totalApplications: totalApps,
        completedApplications: completedApps,
        inProgressApplications: inProgressApps,
        successRate: Math.round(successRate),
        upcomingDeadlines,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      ready: { variant: 'default', icon: CheckCircle2 },
      in_progress: { variant: 'secondary', icon: Clock },
      needs_clarification: { variant: 'outline', icon: AlertCircle },
      not_started: { variant: 'outline', icon: FileText },
    };

    const config = variants[status] || variants.not_started;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your grant application progress and key metrics
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-success">
                {metrics.completedApplications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-info">
                {metrics.inProgressApplications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Success Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {metrics.successRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                Applications with approaching deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming deadlines
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.upcomingDeadlines.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <Link
                          to={`/grants/${item.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.grantName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(item.deadline), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.daysLeft <= 7
                            ? 'destructive'
                            : item.daysLeft <= 14
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {item.daysLeft} days left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/grants">Browse More Grants</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest application updates</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.recentActivity.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <Link
                          to={`/grants/${item.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.grantName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Updated {format(parseISO(item.updatedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/my-applications">View All Applications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button className="w-full" asChild>
                <Link to="/grants">
                  <Target className="mr-2 h-4 w-4" />
                  Browse Grants
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/my-applications">
                  <FileText className="mr-2 h-4 w-4" />
                  My Applications
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/documents">
                  <FileText className="mr-2 h-4 w-4" />
                  Documents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
