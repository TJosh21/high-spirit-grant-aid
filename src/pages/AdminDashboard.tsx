import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Users, Zap, AlertTriangle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UsageLog {
  id: string;
  user_id: string;
  function_name: string;
  created_at: string;
  request_size: number;
  response_size: number;
  profiles?: {
    name: string;
    email: string;
  };
}

interface UsageStats {
  totalRequests: number;
  uniqueUsers: number;
  totalDataProcessed: number;
  avgRequestSize: number;
}

interface UserUsage {
  user_id: string;
  name: string;
  email: string;
  request_count: number;
  total_data: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 0,
    uniqueUsers: 0,
    totalDataProcessed: 0,
    avgRequestSize: 0,
  });
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [topUsers, setTopUsers] = useState<UserUsage[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (!roleData) {
        navigate('/home');
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/home');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load recent logs with user profiles
      const { data: logs, error: logsError } = await supabase
        .from('ai_usage_logs')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setRecentLogs(logs || []);

      // Calculate stats
      if (logs && logs.length > 0) {
        const uniqueUserIds = new Set(logs.map(log => log.user_id));
        const totalData = logs.reduce((sum, log) => sum + (log.request_size || 0) + (log.response_size || 0), 0);
        const avgSize = logs.reduce((sum, log) => sum + (log.request_size || 0), 0) / logs.length;

        setStats({
          totalRequests: logs.length,
          uniqueUsers: uniqueUserIds.size,
          totalDataProcessed: totalData,
          avgRequestSize: Math.round(avgSize),
        });

        // Calculate top users
        const userMap = new Map<string, UserUsage>();
        logs.forEach(log => {
          const existing = userMap.get(log.user_id);
          const dataSize = (log.request_size || 0) + (log.response_size || 0);
          
          if (existing) {
            existing.request_count += 1;
            existing.total_data += dataSize;
          } else {
            userMap.set(log.user_id, {
              user_id: log.user_id,
              name: log.profiles?.name || 'Unknown',
              email: log.profiles?.email || 'Unknown',
              request_count: 1,
              total_data: dataSize,
            });
          }
        });

        const sortedUsers = Array.from(userMap.values())
          .sort((a, b) => b.request_count - a.request_count)
          .slice(0, 10);
        
        setTopUsers(sortedUsers);

        // Calculate hourly data (last 24 hours)
        const now = new Date();
        const hourlyMap = new Map<string, number>();
        
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourKey = format(hour, 'HH:00');
          hourlyMap.set(hourKey, 0);
        }

        logs.forEach(log => {
          const logDate = new Date(log.created_at);
          const hoursDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60));
          
          if (hoursDiff < 24) {
            const hourKey = format(logDate, 'HH:00');
            hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
          }
        });

        const hourlyArray = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
          hour,
          requests: count,
        }));

        setHourlyData(hourlyArray);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground text-lg">AI usage analytics and system monitoring</p>
            </div>
            <Link to="/admin/settings">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              <Activity className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">All time AI requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique users using AI</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Processed</CardTitle>
              <Zap className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatBytes(stats.totalDataProcessed)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total data transferred</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Request Size</CardTitle>
              <AlertTriangle className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatBytes(stats.avgRequestSize)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average input size</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Requests (Last 24 Hours)</CardTitle>
              <CardDescription>Hourly AI request activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Top Users</CardTitle>
              <CardDescription>Most active AI users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topUsers.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }} 
                  />
                  <Bar dataKey="request_count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Activity</CardTitle>
            <CardDescription>Latest AI assistant requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Function</TableHead>
                    <TableHead>Request Size</TableHead>
                    <TableHead>Response Size</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.profiles?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{log.profiles?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.function_name}</Badge>
                      </TableCell>
                      <TableCell>{formatBytes(log.request_size || 0)}</TableCell>
                      <TableCell>{formatBytes(log.response_size || 0)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
