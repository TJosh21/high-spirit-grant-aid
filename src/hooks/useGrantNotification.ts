import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGrantNotification() {
  useEffect(() => {
    // Subscribe to new grant insertions
    const channel = supabase
      .channel('grant-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grants',
        },
        async (payload) => {
          console.log('New grant created:', payload);
          
          // Send notification for new grant
          try {
            const newGrant = payload.new;
            const amount = newGrant.amount_min && newGrant.amount_max
              ? `${newGrant.currency || 'USD'} ${newGrant.amount_min.toLocaleString()} - ${newGrant.amount_max.toLocaleString()}`
              : 'Not specified';

            const tags = [
              ...(newGrant.industry_tags || []),
              ...(newGrant.geography_tags || []),
              ...(newGrant.business_stage_tags || []),
              ...(newGrant.target_audience_tags || [])
            ];

            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'grant_created',
                data: {
                  title: newGrant.name,
                  amount: amount,
                  tags: tags,
                  createdBy: 'Admin System',
                  timestamp: new Date().toISOString(),
                  grantId: newGrant.id,
                  slug: newGrant.slug,
                },
                channels: { email: true, sms: false, push: false }
              }
            });
          } catch (error) {
            console.error('Failed to send grant creation notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
