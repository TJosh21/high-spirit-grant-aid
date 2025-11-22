import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bell, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for new notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new;
          
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Listen for answer updates (application progress)
    const answersChannel = supabase
      .channel('answers-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'answers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const answer = payload.new;
          
          if (answer.status === 'ready') {
            toast({
              title: '✅ Question Completed!',
              description: 'Your answer is ready for submission.',
              duration: 5000,
            });
          } else if (answer.status === 'needs_clarification') {
            toast({
              title: '💡 Clarification Needed',
              description: 'Please review your answer for additional details.',
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for new grants
    const grantsChannel = supabase
      .channel('grants-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grants',
        },
        (payload) => {
          const grant = payload.new;
          
          toast({
            title: '🎉 New Grant Available!',
            description: `Check out: ${grant.name}`,
            duration: 7000,
          });
        }
      )
      .subscribe();

    // Check for upcoming grant deadlines
    const checkDeadlines = async () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: answers } = await supabase
        .from('answers')
        .select('*, grants(*)')
        .eq('user_id', user.id)
        .not('grants.deadline', 'is', null)
        .lte('grants.deadline', threeDaysFromNow.toISOString())
        .gte('grants.deadline', new Date().toISOString());

      if (answers && answers.length > 0) {
        const uniqueGrants = new Map();
        answers.forEach((answer: any) => {
          if (answer.grants && !uniqueGrants.has(answer.grants.id)) {
            uniqueGrants.set(answer.grants.id, answer.grants);
          }
        });

        uniqueGrants.forEach((grant: any) => {
          const daysUntil = Math.ceil(
            (new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          toast({
            title: '⏰ Deadline Reminder',
            description: `${grant.name} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            duration: 7000,
          });
        });
      }
    };

    // Check deadlines on mount
    checkDeadlines();

    // Check deadlines every hour
    const deadlineInterval = setInterval(checkDeadlines, 3600000);

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(answersChannel);
      supabase.removeChannel(grantsChannel);
      clearInterval(deadlineInterval);
    };
  }, [user]);
};
