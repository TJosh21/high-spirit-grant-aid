// High Spirit Welcome Email Template
// Use this template with your email sending service (e.g., Resend)

export interface WelcomeEmailProps {
  firstName: string;
  dashboardUrl: string;
  supportEmail?: string;
}

export const WelcomeEmailHtml = ({ 
  firstName, 
  dashboardUrl,
  supportEmail = 'support@highspirit.com' 
}: WelcomeEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to High Spirit Grant Assistant</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F6FB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #041D4A 0%, #0B2E70 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 48px; height: 48px; background-color: rgba(255,255,255,0.1); border-radius: 12px; display: inline-block; line-height: 48px; margin-bottom: 16px;">
                      <span style="color: #F4AF32; font-size: 24px;">★</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">High Spirit</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Grant Assistant</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 32px;">
              <h2 style="color: #0B1020; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                Welcome aboard, ${firstName}! 🎉
              </h2>
              
              <p style="color: #5C6275; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                You've taken the first step toward winning more grants. High Spirit is here to help you discover funding opportunities, track applications, and write compelling proposals with AI assistance.
              </p>
              
              <!-- Quick Start Tips -->
              <div style="background-color: #F4F6FB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #041D4A; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  Quick Start Tips:
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 24px; vertical-align: top;">
                            <span style="color: #F4AF32;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            <strong style="color: #0B1020;">Browse Grants</strong> – Discover opportunities matched to your profile
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 24px; vertical-align: top;">
                            <span style="color: #F4AF32;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            <strong style="color: #0B1020;">Save Your Favorites</strong> – Build a library of grants to apply for
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 24px; vertical-align: top;">
                            <span style="color: #F4AF32;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            <strong style="color: #0B1020;">Try the AI Coach</strong> – Get help writing winning applications
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #F4AF32 0%, #E5A02D 100%); color: #0B1020; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      Open Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #5C6275; margin: 0; font-size: 14px; line-height: 1.6;">
                If you have any questions, just reply to this email or reach out to our support team at <a href="mailto:${supportEmail}" style="color: #041D4A; text-decoration: underline;">${supportEmail}</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F4F6FB; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #8B95A5; margin: 0 0 8px 0; font-size: 12px;">
                High Spirit Financial & IT Solutions
              </p>
              <p style="color: #8B95A5; margin: 0; font-size: 12px;">
                <a href="#" style="color: #5C6275; text-decoration: underline;">Manage Notifications</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default WelcomeEmailHtml;
