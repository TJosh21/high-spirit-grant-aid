import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { addDays, isBefore, isAfter } from 'date-fns';

export function useGrantNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkDeadlinesAndSendEmails = async () => {
      try {
        // Get notification preferences
        const prefsString = localStorage.getItem('notificationPreferences');
        const prefs = prefsString ? JSON.parse(prefsString) : { email_deadline_reminders: true };

        if (!prefs.email_deadline_reminders) return;

        // Get user's profile for email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (!profile?.email) return;

        // Get user's applications with grant details
        const { data: answers } = await supabase
          .from('answers')
          .select(`
            *,
            grants!inner(*)
          `)
          .eq('user_id', user.id);

        if (!answers) return;

        const threeDaysFromNow = addDays(new Date(), 3);
        const today = new Date();

        // Check each grant deadline
        for (const answer of answers) {
          const grant = (answer as any).grants;
          if (!grant?.deadline) continue;

          const deadline = new Date(grant.deadline);
          
          // Check if deadline is exactly 3 days away
          if (
            isAfter(deadline, today) &&
            isBefore(deadline, threeDaysFromNow)
          ) {
            // Check if we've already sent an email for this grant today
            const sentKey = `email_sent_${grant.id}_${today.toDateString()}`;
            if (localStorage.getItem(sentKey)) continue;

            // Send email notification
            await supabase.functions.invoke('send-email-notification', {
              body: {
                type: 'deadline_reminder',
                to: profile.email,
                data: {
                  grantName: grant.name,
                  deadline: new Date(grant.deadline).toLocaleDateString(),
                  grantSlug: grant.slug,
                },
              },
            });

            // Mark as sent
            localStorage.setItem(sentKey, 'true');
          }
        }
      } catch (error) {
        console.error('Error checking deadlines:', error);
      }
    };

    // Check immediately on mount
    checkDeadlinesAndSendEmails();

    // Check every hour
    const interval = setInterval(checkDeadlinesAndSendEmails, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
}
