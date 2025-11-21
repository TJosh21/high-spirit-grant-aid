import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting usage pattern monitoring...');

    // Get settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('unusual_pattern_threshold')
      .single();

    const threshold = settings?.unusual_pattern_threshold || 100;

    // Check for unusual patterns in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: recentLogs, error: logsError } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', oneHourAgo.toISOString());

    if (logsError) {
      throw logsError;
    }

    if (!recentLogs || recentLogs.length === 0) {
      console.log('No recent activity to monitor');
      return new Response(
        JSON.stringify({ message: 'No recent activity' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing', recentLogs.length, 'logs from the last hour');

    // Check 1: Sudden spike in overall requests
    if (recentLogs.length > threshold) {
      console.log('Unusual pattern detected: High volume -', recentLogs.length, 'requests in last hour');
      
      await supabase.functions.invoke('send-admin-alert', {
        body: {
          alert_type: 'unusual_pattern',
          message: `Unusual spike in AI requests detected. ${recentLogs.length} requests in the last hour (threshold: ${threshold}).`,
          metadata: {
            request_count: recentLogs.length,
            threshold,
            time_window: '1 hour',
          },
        },
      });
    }

    // Check 2: Single user making excessive requests
    const userRequestCounts = new Map<string, number>();
    recentLogs.forEach((log) => {
      const count = userRequestCounts.get(log.user_id) || 0;
      userRequestCounts.set(log.user_id, count + 1);
    });

    for (const [userId, count] of userRequestCounts.entries()) {
      if (count > 30) { // More than 30 requests per hour from single user
        console.log('Unusual pattern detected: Single user excessive usage -', userId, count, 'requests');
        
        await supabase.functions.invoke('send-admin-alert', {
          body: {
            alert_type: 'unusual_pattern',
            message: `User making excessive AI requests: ${count} requests in the last hour.`,
            user_id: userId,
            metadata: {
              request_count: count,
              time_window: '1 hour',
            },
          },
        });
      }
    }

    // Check 3: Unusually large request sizes
    const largeRequests = recentLogs.filter(log => (log.request_size || 0) > 10000);
    if (largeRequests.length > 5) {
      console.log('Unusual pattern detected: Multiple large requests -', largeRequests.length);
      
      const userIds = Array.from(new Set(largeRequests.map(log => log.user_id)));
      
      await supabase.functions.invoke('send-admin-alert', {
        body: {
          alert_type: 'unusual_pattern',
          message: `Detected ${largeRequests.length} unusually large AI requests (>10KB) in the last hour from ${userIds.length} user(s).`,
          metadata: {
            large_request_count: largeRequests.length,
            affected_users: userIds.length,
            time_window: '1 hour',
          },
        },
      });
    }

    // Check 4: Multiple users hitting rate limits
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { data: recentAlerts } = await supabase
      .from('alert_logs')
      .select('user_id')
      .eq('alert_type', 'rate_limit')
      .gte('sent_at', fiveMinutesAgo.toISOString());

    if (recentAlerts && recentAlerts.length > 3) {
      const uniqueUsers = new Set(recentAlerts.map(a => a.user_id).filter(Boolean));
      
      console.log('Unusual pattern detected: Multiple rate limit hits -', uniqueUsers.size, 'users');
      
      await supabase.functions.invoke('send-admin-alert', {
        body: {
          alert_type: 'security',
          message: `${uniqueUsers.size} different users hit rate limits in the last 5 minutes. Possible coordinated abuse attempt.`,
          metadata: {
            affected_users: uniqueUsers.size,
            rate_limit_hits: recentAlerts.length,
            time_window: '5 minutes',
          },
        },
      });
    }

    console.log('Usage pattern monitoring completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Monitoring completed',
        stats: {
          total_requests: recentLogs.length,
          unique_users: userRequestCounts.size,
          large_requests: largeRequests.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in monitoring:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
