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
  type: 'user_registration' | 'welcome_email' | 'grant_created' | 'rough_answer_submitted' | 'polished_answer_generated' | 'user_login' | 'rate_limit';
  data: any;
  channels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.log('SMS credentials not configured, skipping SMS');
      return false;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twilio error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}

async function createPushNotification(supabase: any, userId: string, title: string, message: string, link: string | null, type: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        read: false,
      });

    if (error) {
      console.error('Push notification error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminPhone = Deno.env.get('ADMIN_PHONE_NUMBER');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { type, data, channels = { email: true, sms: false, push: false } }: NotificationRequest = await req.json();

    console.log('Sending notification:', { type, data, channels });

    let emailSuccess = false;
    let smsSuccess = false;
    let pushSuccess = false;
    let errorMessage = '';

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

      case 'welcome_email':
        subject = '🎉 Welcome to High Spirit Grant Assistant – Your Grant Success Journey Starts Now!';
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center; }
                .header h1 { margin: 0 0 10px 0; font-size: 28px; }
                .header p { margin: 0; opacity: 0.9; font-size: 16px; }
                .content { background: white; padding: 30px; border-radius: 0 0 16px 16px; }
                .welcome-box { background: linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center; }
                .welcome-box h2 { margin: 0 0 10px 0; color: #1e40af; }
                .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; }
                .tip-card { background: #f9fafb; border-radius: 10px; padding: 15px; margin-bottom: 12px; border-left: 4px solid #2563eb; }
                .tip-card h3 { margin: 0 0 5px 0; color: #1f2937; font-size: 15px; }
                .tip-card p { margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5; }
                .feature-grid { display: table; width: 100%; }
                .feature-row { display: table-row; }
                .feature { display: table-cell; width: 50%; padding: 10px; vertical-align: top; }
                .feature-inner { background: #f0fdf4; border-radius: 10px; padding: 15px; text-align: center; height: 100%; box-sizing: border-box; }
                .feature-icon { font-size: 28px; margin-bottom: 8px; }
                .feature-title { font-weight: bold; color: #166534; font-size: 14px; margin-bottom: 4px; }
                .feature-desc { color: #6b7280; font-size: 12px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; }
                .cta-section { text-align: center; padding: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                .stats { display: table; width: 100%; margin: 20px 0; }
                .stat { display: table-cell; width: 33.33%; text-align: center; padding: 15px; }
                .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
                .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome, ${data.name}! 🚀</h1>
                  <p>Your journey to winning grants starts now</p>
                </div>
                <div class="content">
                  <div class="welcome-box">
                    <h2>You're All Set!</h2>
                    <p style="color: #4b5563; margin: 0;">Your account has been created successfully. Let's get you started on your path to grant success.</p>
                  </div>

                  <div class="stats">
                    <div class="stat">
                      <div class="stat-number">500+</div>
                      <div class="stat-label">Active Grants</div>
                    </div>
                    <div class="stat">
                      <div class="stat-number">AI</div>
                      <div class="stat-label">Powered Assistant</div>
                    </div>
                    <div class="stat">
                      <div class="stat-number">24/7</div>
                      <div class="stat-label">Available</div>
                    </div>
                  </div>

                  <div class="section-title">⚡ Quick Start Tips</div>
                  
                  <div class="tip-card">
                    <h3>1. Complete Your Business Profile</h3>
                    <p>Add your business details to get personalized grant recommendations with AI-powered matching scores.</p>
                  </div>
                  
                  <div class="tip-card">
                    <h3>2. Browse Matching Grants</h3>
                    <p>Use our AI-powered search to find grants that match your business. Try natural language queries like "grants for women-owned tech startups".</p>
                  </div>
                  
                  <div class="tip-card">
                    <h3>3. Start Your First Application</h3>
                    <p>Select a grant and begin answering questions. Our AI assistant will help polish your responses for maximum impact.</p>
                  </div>
                  
                  <div class="tip-card">
                    <h3>4. Track Your Progress</h3>
                    <p>Use your dashboard to monitor all applications, deadlines, and success predictions in one place.</p>
                  </div>

                  <div class="section-title">✨ Key Features</div>
                  
                  <div class="feature-grid">
                    <div class="feature-row">
                      <div class="feature">
                        <div class="feature-inner">
                          <div class="feature-icon">🤖</div>
                          <div class="feature-title">AI Writing Assistant</div>
                          <div class="feature-desc">Get real-time feedback and polish your answers</div>
                        </div>
                      </div>
                      <div class="feature">
                        <div class="feature-inner">
                          <div class="feature-icon">🎯</div>
                          <div class="feature-title">Smart Matching</div>
                          <div class="feature-desc">Find grants perfect for your business</div>
                        </div>
                      </div>
                    </div>
                    <div class="feature-row">
                      <div class="feature">
                        <div class="feature-inner">
                          <div class="feature-icon">🎤</div>
                          <div class="feature-title">Voice Dictation</div>
                          <div class="feature-desc">Speak your answers, we'll transcribe them</div>
                        </div>
                      </div>
                      <div class="feature">
                        <div class="feature-inner">
                          <div class="feature-icon">📊</div>
                          <div class="feature-title">Success Prediction</div>
                          <div class="feature-desc">AI-powered scoring for your applications</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="cta-section">
                    <a href="${data.dashboardLink}" class="cta-button">Go to Your Dashboard →</a>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">Start exploring grants and building your first application today!</p>
                  </div>
                </div>
                <div class="footer">
                  <p>High Spirit Grant Assistant</p>
                  <p>Empowering businesses to win grants with AI</p>
                  <p style="margin-top: 10px;">Need help? Reply to this email or visit our support center.</p>
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

    // Send email if enabled and configured
    if (channels.email && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        // For welcome emails, send to the user; for other notifications, send to admin
        const recipientEmail = type === 'welcome_email' ? data.email : ADMIN_EMAIL;
        const senderName = type === 'welcome_email' ? 'High Spirit Grant Assistant' : 'High Spirit Alerts';
        
        await resend.emails.send({
          from: `${senderName} <alerts@resend.dev>`,
          to: recipientEmail,
          subject: subject,
          html: html,
        });
        emailSuccess = true;
        console.log('Email sent successfully to', recipientEmail);
      } catch (error) {
        console.error('Email error:', error);
        errorMessage += `Email failed: ${error instanceof Error ? error.message : 'Unknown error'}; `;
      }
    }

    // Send SMS if enabled, for critical events only
    const criticalEvents = ['user_registration', 'polished_answer_generated', 'rate_limit'];
    if (channels.sms && criticalEvents.includes(type) && adminPhone) {
      let smsMessage = '';
      switch (type) {
        case 'user_registration':
          smsMessage = `New user registered: ${data.email}`;
          break;
        case 'polished_answer_generated':
          smsMessage = `Polished answer ready for ${data.grantName} - user: ${data.userEmail}`;
          break;
        case 'rate_limit':
          smsMessage = `ALERT: ${data.violationType} detected at ${new Date(data.timestamp).toLocaleTimeString()}`;
          break;
      }
      
      if (smsMessage) {
        smsSuccess = await sendSMS(adminPhone, smsMessage);
      }
    }

    // Create push notification for user if applicable and enabled
    if (channels.push && data.userId) {
      let pushTitle = '';
      let pushMessage = '';
      let pushLink = '';
      let pushType: 'info' | 'success' | 'warning' | 'error' = 'info';

      switch (type) {
        case 'rough_answer_submitted':
          pushTitle = 'Answer Submitted';
          pushMessage = 'Your answer is being polished by AI. We\'ll notify you when it\'s ready!';
          pushLink = `/answer/${data.grantSlug}/${data.questionId}`;
          pushType = 'info';
          break;
        case 'polished_answer_generated':
          pushTitle = 'Answer Ready!';
          pushMessage = `Your polished answer for ${data.grantName} is ready to view.`;
          pushLink = `/answer/${data.grantSlug}/${data.questionId}`;
          pushType = 'success';
          break;
        case 'grant_created':
          pushTitle = 'New Grant Available';
          pushMessage = `Check out the new grant: ${data.title}`;
          pushLink = `/grants/${data.slug}`;
          pushType = 'info';
          break;
      }

      if (pushTitle && pushMessage) {
        pushSuccess = await createPushNotification(supabase, data.userId, pushTitle, pushMessage, pushLink, pushType);
      }
    }

    // Log to alerts table
    const alertStatus = emailSuccess || smsSuccess || pushSuccess ? 
      (emailSuccess && (!channels.sms || smsSuccess) && (!channels.push || pushSuccess) ? 'success' : 'partial') : 
      'failed';

    await supabase.from('alerts').insert({
      event_type: type,
      user_id: data.userId || null,
      user_email: data.email || data.userEmail || null,
      grant_id: data.grantId || null,
      grant_name: data.grantName || data.title || null,
      channel_email: channels.email && emailSuccess,
      channel_sms: channels.sms && smsSuccess,
      channel_push: channels.push && pushSuccess,
      status: alertStatus,
      error_message: errorMessage || null,
      metadata: data,
    });

    console.log('Notification processing complete:', { 
      emailSuccess, 
      smsSuccess, 
      pushSuccess, 
      status: alertStatus 
    });

    return new Response(
      JSON.stringify({ 
        success: alertStatus !== 'failed', 
        message: 'Notification processed',
        details: {
          email: emailSuccess,
          sms: smsSuccess,
          push: pushSuccess,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('alerts').insert({
        event_type: 'error',
        status: 'failed',
        error_message: errorMsg,
        metadata: { error: errorMsg },
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
