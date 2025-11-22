import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  type: 'deadline_reminder' | 'status_update' | 'new_grant';
  to: string;
  data: {
    grantName?: string;
    deadline?: string;
    status?: string;
    applicationId?: string;
    grantSlug?: string;
    questionId?: string;
    newGrantCount?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailNotificationRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case 'deadline_reminder':
        subject = `⏰ Grant Deadline Reminder: ${data.grantName}`;
        html = `
          <h1>Grant Deadline Approaching</h1>
          <p>This is a friendly reminder that the deadline for <strong>${data.grantName}</strong> is approaching.</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <p>Make sure to complete and submit your application before the deadline!</p>
          <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/grants/${data.grantSlug}" 
             style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Grant Details
          </a>
        `;
        break;

      case 'status_update':
        subject = `📋 Application Status Update: ${data.grantName}`;
        html = `
          <h1>Application Status Update</h1>
          <p>Your application for <strong>${data.grantName}</strong> has been updated.</p>
          <p><strong>New Status:</strong> ${data.status}</p>
          ${data.status === 'ready' 
            ? `<p>Your polished answer is ready! You can now review and submit your application.</p>` 
            : data.status === 'needs_clarification'
            ? `<p>We need some additional information from you to complete your application.</p>`
            : `<p>Check your application for more details.</p>`
          }
          <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/grants/${data.grantSlug}/answer/${data.questionId}" 
             style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Application
          </a>
        `;
        break;

      case 'new_grant':
        subject = `🎯 New Grant Opportunities Available`;
        html = `
          <h1>New Grant Opportunities</h1>
          <p>We found ${data.newGrantCount || 1} new grant ${(data.newGrantCount || 1) > 1 ? 'opportunities' : 'opportunity'} that match your profile!</p>
          <p>Don't miss out on these funding opportunities for your business.</p>
          <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/grants" 
             style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Browse Grants
          </a>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Grant Compass <notifications@resend.dev>",
      to: [to],
      subject,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${html}
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            You're receiving this email because you have email notifications enabled in your profile settings.
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/profile" style="color: #6366f1;">
              Manage notification preferences
            </a>
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
