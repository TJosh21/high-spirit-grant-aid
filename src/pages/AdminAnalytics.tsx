import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState('7');
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalGrants: 0,
    totalApplications: 0,
    totalPolishedAnswers: 0,
    recentAlerts: 0,
  });

  // Chart data state
  const [applicationsOverTime, setApplicationsOverTime] = useState<any[]>([]);
  const [grantCategoryBreakdown, setGrantCategoryBreakdown] = useState<any[]>([]);
  const [alertsByType, setAlertsByType] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user, dateRange]);

  const checkAdminAndLoadData = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      navigate('/home');
      return;
    }

    setIsAdmin(true);
    await loadAnalytics();
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));
      const endDate = endOfDay(new Date());

      // Load top-level metrics
      const [usersData, grantsData, applicationsData, polishedData, alertsData] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('grants').select('id', { count: 'exact', head: true }),
        supabase.from('answers').select('id', { count: 'exact', head: true }),
        supabase.from('answers').select('id', { count: 'exact', head: true }).not('ai_polished_answer', 'is', null),
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
      ]);

      setMetrics({
        totalUsers: usersData.count || 0,
        totalGrants: grantsData.count || 0,
        totalApplications: applicationsData.count || 0,
        totalPolishedAnswers: polishedData.count || 0,
        recentAlerts: alertsData.count || 0,
      });

      // Load applications over time
      const { data: answersTimeData } = await supabase
        .from('answers')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      const applicationsByDay = answersTimeData?.reduce((acc: any, answer) => {
        const date = format(new Date(answer.created_at!), 'MMM dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      setApplicationsOverTime(
        Object.entries(applicationsByDay || {}).map(([date, count]) => ({
          date,
          applications: count,
        }))
      );

      // Load grant category breakdown
      const { data: grantsWithTags } = await supabase
        .from('grants')
        .select('industry_tags, business_stage_tags, target_audience_tags');

      const categoryCount: any = {};
      grantsWithTags?.forEach(grant => {
        [...(grant.industry_tags || []), ...(grant.business_stage_tags || []), ...(grant.target_audience_tags || [])].forEach(tag => {
          categoryCount[tag] = (categoryCount[tag] || 0) + 1;
        });
      });

      setGrantCategoryBreakdown(
        Object.entries(categoryCount)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }))
      );

      // Load alerts by type
      const { data: alertsTypeData } = await supabase
        .from('alerts')
        .select('event_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const alertTypeCount = alertsTypeData?.reduce((acc: any, alert) => {
        const type = alert.event_type.replace(/_/g, ' ');
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setAlertsByType(
        Object.entries(alertTypeCount || {}).map(([name, value]) => ({
          name,
          count: value,
        }))
      );

      // Load user activity (logins)
      const { data: loginData } = await supabase
        .from('alerts')
        .select('created_at')
        .eq('event_type', 'user_login')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      const loginsByDay = loginData?.reduce((acc: any, alert) => {
        const date = format(new Date(alert.created_at!), 'MMM dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      setUserActivity(
        Object.entries(loginsByDay || {}).map(([date, logins]) => ({
          date,
          logins,
        }))
      );

      // Load conversion funnel
      const totalUsersCount = usersData.count || 0;
      
      const { data: usersWithAnswersData } = await supabase
        .from('answers')
        .select('user_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const uniqueUsersWithAnswers = new Set(usersWithAnswersData?.map(a => a.user_id));
      
      const { data: usersWithRoughData } = await supabase
        .from('answers')
        .select('user_id')
        .not('user_rough_answer', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const uniqueUsersWithRough = new Set(usersWithRoughData?.map(a => a.user_id));
      
      const { data: usersWithPolishedData } = await supabase
        .from('answers')
        .select('user_id')
        .not('ai_polished_answer', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const uniqueUsersWithPolished = new Set(usersWithPolishedData?.map(a => a.user_id));

      const funnelData = [
        { stage: 'Total Users', count: totalUsersCount },
        { stage: 'Started Application', count: uniqueUsersWithAnswers.size },
        { stage: 'Submitted Answers', count: uniqueUsersWithRough.size },
        { stage: 'Polished Answers', count: uniqueUsersWithPolished.size },
      ];

      setConversionFunnel(funnelData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Insights and metrics for High Spirit Grant Assistant</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalGrants}</div>
              <p className="text-xs text-muted-foreground">Available opportunities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Started by users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Polished</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPolishedAnswers}</div>
              <p className="text-xs text-muted-foreground">Completed answers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.recentAlerts}</div>
              <p className="text-xs text-muted-foreground">In selected period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Applications Over Time</CardTitle>
                  <CardDescription>Number of applications started per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={applicationsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Logins</CardTitle>
                  <CardDescription>Daily login activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="logins" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grant Category Breakdown</CardTitle>
                <CardDescription>Distribution of grants by category/tags</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={grantCategoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {grantCategoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
                <CardDescription>Breakdown of alert events by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={alertsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from registration to completed applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6">
                      {conversionFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
