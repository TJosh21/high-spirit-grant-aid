import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LiveCollaborationProps {
  answerId: string;
}

interface Presence {
  userId: string;
  userName: string;
  cursorPosition?: { x: number; y: number };
  color: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function LiveCollaboration({ answerId }: LiveCollaborationProps) {
  const { user } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [userColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);

  useEffect(() => {
    if (!user || !answerId) return;

    const channel = supabase.channel(`answer:${answerId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers: Presence[] = [];
        
        Object.keys(state).forEach((userId) => {
          const presenceData = state[userId][0] as any;
          if (userId !== user.id) {
            activeUsers.push({
              userId,
              userName: presenceData.userName,
              cursorPosition: presenceData.cursorPosition,
              color: presenceData.color,
            });
          }
        });
        
        setPresences(activeUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          await channel.track({
            userName: profile?.name || 'Anonymous',
            color: userColor,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Track cursor position
    const handleMouseMove = (e: MouseEvent) => {
      channel.track({
        userName: user.email?.split('@')[0] || 'Anonymous',
        color: userColor,
        cursorPosition: { x: e.clientX, y: e.clientY },
        online_at: new Date().toISOString(),
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      supabase.removeChannel(channel);
    };
  }, [user, answerId, userColor]);

  if (presences.length === 0) return null;

  return (
    <>
      {/* Active users indicator */}
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
        <div className="flex -space-x-2">
          {presences.slice(0, 3).map((presence) => (
            <Avatar key={presence.userId} className="h-8 w-8 border-2 border-background">
              <AvatarFallback style={{ backgroundColor: presence.color }}>
                {presence.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="text-sm">
          <span className="font-medium">{presences.length}</span>
          <span className="text-muted-foreground"> {presences.length === 1 ? 'user' : 'users'} editing</span>
        </div>
      </div>

      {/* Live cursors */}
      {presences.map((presence) => (
        presence.cursorPosition && (
          <div
            key={presence.userId}
            className="pointer-events-none fixed z-50 transition-all duration-100"
            style={{
              left: presence.cursorPosition.x,
              top: presence.cursorPosition.y,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.65376 12.3673L11.6538 18.3673L12.3538 11.3673L19.3538 12.3673L5.65376 12.3673Z"
                fill={presence.color}
              />
            </svg>
            <Badge
              className="ml-2 -mt-1"
              style={{
                backgroundColor: presence.color,
                color: 'white',
              }}
            >
              {presence.userName}
            </Badge>
          </div>
        )
      ))}
    </>
  );
}
