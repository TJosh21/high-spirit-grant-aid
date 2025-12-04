// High Spirit Trial Ending Email Template

export interface TrialEndingEmailProps {
  firstName: string;
  daysLeft: number;
  pricingUrl: string;
  dashboardUrl: string;
  supportEmail?: string;
}

export const TrialEndingEmailHtml = ({ 
  firstName, 
  daysLeft,
  pricingUrl,
  dashboardUrl,
  supportEmail = 'support@highspirit.com' 
}: TrialEndingEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trial is Ending Soon</title>
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
                    <h1 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">High Spirit</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Trial Reminder</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 32px;">
              <!-- Trial Banner -->
              <div style="background: linear-gradient(135deg, #F4AF32 0%, #FFE5B5 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <span style="color: #0B1020; font-size: 32px; font-weight: 700;">${daysLeft}</span>
                <p style="color: #0B1020; margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">
                  day${daysLeft !== 1 ? 's' : ''} left in your trial
                </p>
              </div>
              
              <h2 style="color: #0B1020; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
                Keep the momentum going, ${firstName}!
              </h2>
              
              <p style="color: #5C6275; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                Your High Spirit trial is ending soon. Don't lose access to the tools that help you win more grants.
              </p>
              
              <!-- Benefits Reminder -->
              <div style="background-color: #F4F6FB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #041D4A; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  What you'll keep with a paid plan:
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 24px; vertical-align: top;">
                            <span style="color: #0E9F6E;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            Unlimited saved grants
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
                            <span style="color: #0E9F6E;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            AI Writing Coach for better applications
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
                            <span style="color: #0E9F6E;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            Priority grant matching
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
                            <span style="color: #0E9F6E;">✓</span>
                          </td>
                          <td style="color: #5C6275; font-size: 14px;">
                            Advanced analytics & insights
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${pricingUrl}" style="display: inline-block; background: linear-gradient(135deg, #F4AF32 0%, #E5A02D 100%); color: #0B1020; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      Choose a Plan →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 16px 0 0 0;">
                    <a href="${dashboardUrl}" style="color: #041D4A; font-size: 14px; font-weight: 500; text-decoration: underline;">
                      Continue with free plan
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F4F6FB; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #8B95A5; margin: 0 0 8px 0; font-size: 12px;">
                Questions? Reply to this email or reach out at <a href="mailto:${supportEmail}" style="color: #5C6275; text-decoration: underline;">${supportEmail}</a>
              </p>
              <p style="color: #8B95A5; margin: 0; font-size: 12px;">
                High Spirit Financial & IT Solutions
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

export default TrialEndingEmailHtml;
