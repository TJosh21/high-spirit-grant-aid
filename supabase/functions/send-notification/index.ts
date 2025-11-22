import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'taiwo@highspiritfinancial.com';

interface NotificationRequest {
  type: 'user_registration' | 'grant_created' | 'rough_answer_submitted' | 'polished_answer_generated' | 'user_login' | 'rate_limit';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const { type, data }: NotificationRequest = await req.json();

    console.log('Sending notification:', { type, data });

    let subject = '';
    let html = '';

    switch (type) {
      case 'user_registration':
        subject = 'New User Registered – High Spirit Grant Assistant';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🎉 New User Registration</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">User Name:</p>
                    <p class="value">${data.name}</p>
                    
                    <p class="label">Email:</p>
                    <p class="value">${data.email}</p>
                    
                    <p class="label">Registration Time:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                    
                    <p class="label">Profile Link:</p>
                    <p class="value"><a href="${data.profileLink}">${data.profileLink}</a></p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'grant_created':
        subject = 'New Grant Added to Your App';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #059669; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
                .tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
                .tag { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">💰 New Grant Added</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">Grant Title:</p>
                    <p class="value">${data.title}</p>
                    
                    <p class="label">Funding Amount:</p>
                    <p class="value">${data.amount}</p>
                    
                    <p class="label">Categories:</p>
                    <div class="tags">
                      ${(data.tags || []).map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <p class="label">Created By:</p>
                    <p class="value">${data.createdBy}</p>
                    
                    <p class="label">Timestamp:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'rough_answer_submitted':
        subject = 'User Submitted a Rough Answer';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #7c3aed; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
                .answer-box { background: #fef3c7; padding: 15px; border-radius: 4px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">📝 Rough Answer Submitted</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">Grant Name:</p>
                    <p class="value">${data.grantName}</p>
                    
                    <p class="label">Question:</p>
                    <p class="value">${data.questionText}</p>
                    
                    <p class="label">User Email:</p>
                    <p class="value">${data.userEmail}</p>
                    
                    <p class="label">Rough Answer:</p>
                    <div class="answer-box">${data.roughAnswer}</div>
                    
                    <p class="label">Timestamp:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'polished_answer_generated':
        subject = 'Polished Answer Ready';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #059669; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
                .answer-box { background: #f0fdf4; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #86efac; }
                .rough-box { background: #fef3c7; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #fde047; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">✨ Polished Answer Generated</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">Grant Name:</p>
                    <p class="value">${data.grantName}</p>
                    
                    <p class="label">Question:</p>
                    <p class="value">${data.questionText}</p>
                    
                    <p class="label">User Email:</p>
                    <p class="value">${data.userEmail}</p>
                    
                    <p class="label">Original Rough Answer:</p>
                    <div class="rough-box">${data.roughAnswer}</div>
                    
                    <p class="label">Final Polished Answer:</p>
                    <div class="answer-box">${data.polishedAnswer}</div>
                    
                    <p class="label">Timestamp:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'user_login':
        subject = 'User Logged In';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0891b2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #0891b2; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🔐 User Login Activity</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">User Email:</p>
                    <p class="value">${data.email}</p>
                    
                    <p class="label">Login Time:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                    
                    <p class="label">Device Info:</p>
                    <p class="value">${data.deviceInfo || 'Not available'}</p>
                    
                    <p class="label">IP Address:</p>
                    <p class="value">${data.ipAddress || 'Not available'}</p>
                    
                    <p class="label">Account Status:</p>
                    <p class="value">Active</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'rate_limit':
        subject = '⚠️ API Limit or Unusual Usage Detected';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; margin-top: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⚠️ Rate Limit Alert</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p class="label">Type of Violation:</p>
                    <p class="value">${data.violationType}</p>
                    
                    <p class="label">Details:</p>
                    <p class="value">${data.details}</p>
                    
                    <p class="label">Recommended Action:</p>
                    <p class="value">${data.recommendedAction}</p>
                    
                    <p class="label">Timestamp:</p>
                    <p class="value">${new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email
    await resend.emails.send({
      from: 'High Spirit Alerts <alerts@resend.dev>',
      to: ADMIN_EMAIL,
      subject: subject,
      html: html,
    });

    console.log('Notification sent successfully to', ADMIN_EMAIL);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
