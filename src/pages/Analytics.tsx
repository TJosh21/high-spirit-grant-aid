import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

type AnalyticsData = {
  totalApplications: number;
  inProgress: number;
  completed: number;
  avgMatchScore: number;
  avgTimeToComplete: number;
  successRate: number;
  matchScoreDistribution: Array<{ range: string; count: number }>;
  applicationsByStatus: Array<{ status: string; count: number; color: string }>;
  completionTimeline: Array<{ month: string; completed: number }>;
};

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Load all answers for the user
      const { data: answers } = await supabase
        .from('answers')
        .select('*, grants(*), profiles(*)')
        .eq('user_id', user?.id);

      if (!answers) {
        setLoading(false);
        return;
      }

      // Load user profile for matching
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Calculate analytics
      const totalApplications = answers.length;
      const completed = answers.filter((a) => a.status === 'ready').length;
      const inProgress = answers.filter((a) => a.status === 'in_progress').length;

      // Calculate match scores using grant data
      const matchScores = answers
        .filter((a) => a.grants)
        .map((a) => {
          const grant = a.grants;
          let score = 50; // Base score

          // Industry match
          if (grant.industry_tags?.includes(profile?.business_industry)) {
            score += 15;
          }

          // Geography match
          if (grant.geography_tags?.includes(profile?.country)) {
            score += 15;
          }

          // Business stage match
          const yearsInBusiness = profile?.years_in_business || 0;
          if (yearsInBusiness < 2 && grant.business_stage_tags?.includes('startup')) {
            score += 10;
          } else if (yearsInBusiness >= 2 && grant.business_stage_tags?.includes('established')) {
            score += 10;
          }

          return Math.min(score, 100);
        });

      const avgMatchScore = matchScores.length > 0
        ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
        : 0;

      // Calculate time to complete (in days)
      const completedAnswers = answers.filter(
        (a) => a.status === 'ready' && a.created_at && a.last_updated_at
      );
      
      const avgTimeToComplete = completedAnswers.length > 0
        ? Math.round(
            completedAnswers.reduce((sum, a) => {
              const created = new Date(a.created_at!);
              const updated = new Date(a.last_updated_at!);
              const days = Math.max(1, Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
              return sum + days;
            }, 0) / completedAnswers.length
          )
        : 0;

      // Match score distribution
      const matchScoreDistribution = [
        { range: '0-20', count: matchScores.filter((s) => s <= 20).length },
        { range: '21-40', count: matchScores.filter((s) => s > 20 && s <= 40).length },
        { range: '41-60', count: matchScores.filter((s) => s > 40 && s <= 60).length },
        { range: '61-80', count: matchScores.filter((s) => s > 60 && s <= 80).length },
        { range: '81-100', count: matchScores.filter((s) => s > 80).length },
      ];

      // Applications by status
      const statusCounts = {
        not_started: answers.filter((a) => a.status === 'not_started').length,
        in_progress: inProgress,
        needs_clarification: answers.filter((a) => a.status === 'needs_clarification').length,
        ready: completed,
      };

      const applicationsByStatus = [
        { status: 'Not Started', count: statusCounts.not_started, color: '#94a3b8' },
        { status: 'In Progress', count: statusCounts.in_progress, color: '#3b82f6' },
        { status: 'Needs Review', count: statusCounts.needs_clarification, color: '#f59e0b' },
        { status: 'Completed', count: statusCounts.ready, color: '#10b981' },
      ].filter((item) => item.count > 0);

      // Completion timeline (last 6 months)
      const completionTimeline = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        
        const count = completedAnswers.filter((a) => {
          const updatedDate = new Date(a.last_updated_at!);
          return (
            updatedDate.getMonth() === date.getMonth() &&
            updatedDate.getFullYear() === date.getFullYear()
          );
        }).length;

        return { month: `${month} ${year}`, completed: count };
      });

      setAnalytics({
        totalApplications,
        inProgress,
        completed,
        avgMatchScore,
        avgTimeToComplete,
        successRate: totalApplications > 0 ? Math.round((completed / totalApplications) * 100) : 0,
        matchScoreDistribution,
        applicationsByStatus,
        completionTimeline,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">No Data Yet</h1>
          <p className="text-muted-foreground">
            Start applying to grants to see your analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your grant application performance and success metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completed} of {analytics.totalApplications} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgMatchScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100 points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time to Complete</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgTimeToComplete}</div>
              <p className="text-xs text-muted-foreground">
                Days per application
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Active applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>Current status of all your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.applicationsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Match Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grant Match Score Distribution</CardTitle>
              <CardDescription>How well grants match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.matchScoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Application Completion Timeline</CardTitle>
              <CardDescription>Completed applications over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.completionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Completed Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
