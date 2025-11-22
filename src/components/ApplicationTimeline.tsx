import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileEdit, CheckCircle, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ActivityLog = {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  metadata?: any;
  profiles?: {
    name: string;
    email: string;
  };
};

type Props = {
  answerId: string;
};

export function ApplicationTimeline({ answerId }: Props) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [answerId]);

  const loadActivities = async () => {
    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('answer_id', answerId)
        .order('created_at', { ascending: false });

      if (data) {
        // Fetch profiles separately
        const activitiesWithProfiles = await Promise.all(
          data.map(async (activity) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', activity.user_id)
              .single();

            return {
              ...activity,
              profiles: profile,
            };
          })
        );

        setActivities(activitiesWithProfiles);
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileEdit className="h-4 w-4" />;
      case 'updated':
        return <FileEdit className="h-4 w-4" />;
      case 'status_changed':
        return <CheckCircle className="h-4 w-4" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4" />;
      case 'ai_polished':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-blue-500';
      case 'updated':
        return 'text-yellow-500';
      case 'status_changed':
        return 'text-green-500';
      case 'commented':
        return 'text-purple-500';
      case 'ai_polished':
        return 'text-pink-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          Track all changes and milestones for this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activity yet
          </p>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-card ${getActivityColor(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {activity.activity_description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.profiles?.name || 'Unknown user'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(activity.created_at)}
                    </Badge>
                  </div>
                  
                  {activity.metadata && (
                    <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">
                      {activity.metadata.old_status && activity.metadata.new_status && (
                        <span>
                          <span className="text-muted-foreground">{activity.metadata.old_status}</span>
                          {' → '}
                          <span className="font-medium">{activity.metadata.new_status}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
