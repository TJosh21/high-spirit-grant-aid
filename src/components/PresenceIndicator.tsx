import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PresenceIndicatorProps {
  answerId: string;
}

interface PresenceUser {
  user_id: string;
  name: string;
  email: string;
  presence_ref: string;
}

export function PresenceIndicator({ answerId }: PresenceIndicatorProps) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`answer:${answerId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.keys(state).forEach((presenceKey) => {
          const presences = state[presenceKey] as any[];
          presences.forEach((presence) => {
            users.push(presence as PresenceUser);
          });
        });
        
        setPresentUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', user.id)
              .single();

            await channel.track({
              user_id: user.id,
              name: profile?.name || 'Anonymous',
              email: profile?.email || '',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [answerId]);

  if (presentUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Currently viewing:</span>
      <TooltipProvider>
        <div className="flex -space-x-2">
          {presentUsers.map((user) => (
            <Tooltip key={user.presence_ref}>
              <TooltipTrigger>
                <Avatar className="border-2 border-background w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}