import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  alert_type: 'rate_limit' | 'unusual_pattern' | 'security';
  message: string;
  user_id?: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alert_type, message, user_id, metadata }: AlertRequest = await req.json();

    console.log('Sending alert:', { alert_type, message, user_id });

    // Get admin email addresses from settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('alert_emails')
      .single();

    if (settingsError) {
      console.error('Error fetching admin settings:', settingsError);
      throw new Error('Failed to fetch admin settings');
    }

    if (!settings?.alert_emails || settings.alert_emails.length === 0) {
      console.log('No admin emails configured, skipping alert');
      return new Response(
        JSON.stringify({ message: 'No admin emails configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user details if user_id provided
    let userDetails = '';
    if (user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user_id)
        .single();

      if (profile) {
        userDetails = `
          <p><strong>User:</strong> ${profile.name} (${profile.email})</p>
        `;
      }
    }

    // Format alert type for display
    const alertTypeDisplay = alert_type.replace('_', ' ').toUpperCase();
    const alertColor = alert_type === 'rate_limit' ? '#F59E0B' : alert_type === 'security' ? '#EF4444' : '#3B82F6';

    // Send email alert
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${alertColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-box { background: white; padding: 15px; border-left: 4px solid ${alertColor}; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            .metadata { background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 ${alertTypeDisplay} ALERT</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">High Spirit Grant Assistant</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2 style="margin-top: 0; color: ${alertColor};">Alert Details</h2>
                <p><strong>Type:</strong> ${alertTypeDisplay}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                ${userDetails}
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                ${metadata ? `<div class="metadata">${JSON.stringify(metadata, null, 2)}</div>` : ''}
              </div>
              <p><strong>Recommended Actions:</strong></p>
              <ul>
                ${alert_type === 'rate_limit' 
                  ? '<li>Review user activity in the admin dashboard</li><li>Check if this is legitimate usage or potential abuse</li><li>Consider adjusting rate limits if necessary</li>' 
                  : alert_type === 'unusual_pattern'
                  ? '<li>Investigate the unusual activity pattern</li><li>Check for potential security issues</li><li>Review AI usage logs for anomalies</li>'
                  : '<li>Investigate the security issue immediately</li><li>Review system logs</li><li>Take appropriate action to secure the system</li>'
                }
              </ul>
              <p style="margin-top: 20px;">
                <a href="${supabaseUrl.replace('https://', 'https://app.')}/project/gosszudhblnahkxlcuqq/editor" 
                   style="background: ${alertColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View Admin Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated alert from High Spirit Grant Assistant monitoring system.</p>
              <p>To update your alert preferences, configure the admin settings in the dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all admin addresses
    const emailPromises = settings.alert_emails.map((email: string) =>
      resend.emails.send({
        from: 'High Spirit Alerts <alerts@resend.dev>',
        to: email,
        subject: `🚨 ${alertTypeDisplay} Alert - High Spirit Grant Assistant`,
        html: emailHtml,
      })
    );

    await Promise.all(emailPromises);

    // Log the alert
    await supabase.from('alert_logs').insert({
      alert_type,
      alert_message: message,
      user_id,
      metadata,
    });

    console.log('Alert sent successfully to', settings.alert_emails.length, 'admins');

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
