import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Send notification to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "High Spirit <onboarding@resend.dev>",
        to: ["support@highspiritgrants.org"],
        subject: `New Contact Form: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F6FB; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #041D4A 0%, #0C3275 100%); padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                              <strong style="color: #041D4A;">From:</strong>
                              <span style="color: #6B7280; margin-left: 8px;">${name}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                              <strong style="color: #041D4A;">Email:</strong>
                              <a href="mailto:${email}" style="color: #F4AF32; margin-left: 8px; text-decoration: none;">${email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                              <strong style="color: #041D4A;">Subject:</strong>
                              <span style="color: #6B7280; margin-left: 8px;">${subject}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <strong style="color: #041D4A; display: block; margin-bottom: 8px;">Message:</strong>
                              <div style="background-color: #F4F6FB; padding: 16px; border-radius: 8px; color: #374151; line-height: 1.6;">
                                ${message.replace(/\n/g, '<br>')}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #F4F6FB; padding: 24px; text-align: center;">
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">High Spirit Grant Assistant</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    // Send confirmation to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "High Spirit <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message - High Spirit",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F6FB; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #041D4A 0%, #0C3275 100%); padding: 32px; text-align: center;">
                        <div style="width: 48px; height: 48px; background-color: rgba(255,255,255,0.1); border-radius: 12px; margin: 0 auto 16px; line-height: 48px;">
                          <span style="color: #F4AF32; font-size: 24px; font-weight: bold;">HS</span>
                        </div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Thank You, ${name}!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                          We've received your message and appreciate you reaching out to us.
                        </p>
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                          Our team typically responds within <strong style="color: #041D4A;">24-48 business hours</strong>. In the meantime, feel free to explore our grant database or check out our FAQ page.
                        </p>
                        <div style="background-color: #F4F6FB; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                          <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px;"><strong>Your message:</strong></p>
                          <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">"${subject}"</p>
                        </div>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="https://highspiritgrants.org/grants" style="display: inline-block; background-color: #041D4A; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Explore Grants
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #F4F6FB; padding: 24px; text-align: center;">
                        <p style="color: #6B7280; margin: 0 0 8px; font-size: 14px;">High Spirit Financial & IT Solutions</p>
                        <p style="color: #9CA3AF; margin: 0; font-size: 12px;">Empowering entrepreneurs to win more grants</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    console.log("Emails sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
