// High Spirit Deadline Reminder Email Template

export interface DeadlineReminderEmailProps {
  firstName: string;
  grantTitle: string;
  grantFunder: string;
  deadline: string;
  daysLeft: number;
  grantUrl: string;
  supportEmail?: string;
}

export const DeadlineReminderEmailHtml = ({ 
  firstName, 
  grantTitle,
  grantFunder,
  deadline,
  daysLeft,
  grantUrl,
  supportEmail = 'support@highspirit.com' 
}: DeadlineReminderEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grant Deadline Reminder</title>
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
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Deadline Reminder</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 32px;">
              <!-- Alert Banner -->
              <div style="background-color: ${daysLeft <= 3 ? '#FEE2E2' : '#FEF3C7'}; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <span style="color: ${daysLeft <= 3 ? '#E11D48' : '#F59E0B'}; font-size: 14px; font-weight: 600;">
                  ⏰ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to apply!
                </span>
              </div>
              
              <h2 style="color: #0B1020; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
                Hey ${firstName}, don't miss this deadline!
              </h2>
              
              <p style="color: #5C6275; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                A grant you saved is closing soon. Make sure to submit your application before time runs out.
              </p>
              
              <!-- Grant Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #F4F6FB; border-radius: 12px; padding: 24px;">
                    <h3 style="color: #0B1020; margin: 0 0 4px 0; font-size: 18px; font-weight: 600;">
                      ${grantTitle}
                    </h3>
                    <p style="color: #5C6275; margin: 0 0 16px 0; font-size: 14px;">
                      ${grantFunder}
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 8px;">
                          <span style="color: #5C6275; font-size: 14px;">Deadline:</span>
                        </td>
                        <td>
                          <span style="display: inline-block; background-color: ${daysLeft <= 3 ? '#E11D48' : '#F59E0B'}; color: #FFFFFF; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
                            ${deadline}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${grantUrl}" style="display: inline-block; background: linear-gradient(135deg, #F4AF32 0%, #E5A02D 100%); color: #0B1020; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      Update Your Application →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #5C6275; margin: 0; font-size: 14px; line-height: 1.6; text-align: center;">
                Stay on track with High Spirit. We're rooting for you! 🌟
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
                <a href="#" style="color: #5C6275; text-decoration: underline;">Manage Notifications</a> · 
                <a href="mailto:${supportEmail}" style="color: #5C6275; text-decoration: underline;">Contact Support</a>
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

export default DeadlineReminderEmailHtml;
