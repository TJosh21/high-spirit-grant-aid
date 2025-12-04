import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bookmark,
  Send,
  Trophy,
  XCircle,
  FileQuestion,
  ChevronRight,
  Calendar,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';

interface TrackedGrant {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  grant: {
    id: string;
    name: string;
    sponsor_name: string;
    deadline: string | null;
    amount_max: number | null;
  };
}

const STATUS_CONFIG = {
  saved: { label: 'Saved', icon: Bookmark, color: 'text-primary' },
  planning: { label: 'Planning', icon: FileQuestion, color: 'text-accent' },
  applied: { label: 'Applied', icon: Send, color: 'text-status-info' },
  awarded: { label: 'Awarded', icon: Trophy, color: 'text-status-success' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-destructive' },
  not_eligible: { label: 'Not Eligible', icon: XCircle, color: 'text-muted-foreground' },
};

const MyGrants = () => {
  const { user } = useAuth();
  const [grants, setGrants] = useState<TrackedGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      loadGrants();
    }
  }, [user]);

  const loadGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('user_grants')
        .select(`
          id,
          status,
          notes,
          created_at,
          grants!inner (
            id,
            name,
            sponsor_name,
            deadline,
            amount_max
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map(item => ({
        id: item.id,
        status: item.status,
        notes: item.notes,
        created_at: item.created_at,
        grant: item.grants as any
      }));
      
      setGrants(formatted);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userGrantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_grants')
        .update({ 
          status: newStatus,
          last_updated_by_user_at: new Date().toISOString()
        })
        .eq('id', userGrantId);

      if (error) throw error;
      
      setGrants(prev => prev.map(g => 
        g.id === userGrantId ? { ...g, status: newStatus } : g
      ));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredGrants = activeTab === 'all' 
    ? grants 
    : grants.filter(g => g.status === activeTab);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: grants.length };
    grants.forEach(g => {
      counts[g.status] = (counts[g.status] || 0) + 1;
    });
    return counts;
  };

  const counts = getStatusCounts();

  if (loading) return <LoadingScreen />;

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">My Grants</h1>
          <Link to="/grants">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="flex-1 min-w-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="flex-1 min-w-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Saved ({counts.saved || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="planning"
              className="flex-1 min-w-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Planning ({counts.planning || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="applied"
              className="flex-1 min-w-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Applied ({counts.applied || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredGrants.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No grants yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by browsing available grants
                  </p>
                  <Link to="/grants">
                    <Button>Browse Grants</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredGrants.map((item) => {
                const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.saved;
                const daysLeft = item.grant.deadline 
                  ? Math.ceil((new Date(item.grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Link to={`/grants/${item.grant.id}`} className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                            {item.grant.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.grant.sponsor_name}
                          </p>
                        </Link>
                        <Link to={`/grants/${item.grant.id}`}>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {daysLeft !== null && daysLeft > 0 && (
                          <Badge 
                            variant={daysLeft <= 7 ? "destructive" : "secondary"}
                            className="gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            {daysLeft} days left
                          </Badge>
                        )}
                        {item.grant.amount_max && (
                          <Badge variant="outline">
                            Up to ${item.grant.amount_max.toLocaleString()}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Select
                          value={item.status}
                          onValueChange={(v) => updateStatus(item.id, v)}
                        >
                          <SelectTrigger className="h-8 w-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                              <SelectItem key={value} value={value}>
                                <span className="flex items-center gap-2">
                                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                                  {cfg.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-3 p-2 bg-secondary/50 rounded">
                          {item.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default MyGrants;
