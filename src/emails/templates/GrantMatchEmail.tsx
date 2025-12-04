// High Spirit Grant Match Alert Email Template

export interface Grant {
  title: string;
  funder: string;
  amountRange: string;
  deadline: string;
  viewUrl: string;
}

export interface GrantMatchEmailProps {
  firstName: string;
  grants: Grant[];
  viewAllUrl: string;
  supportEmail?: string;
}

export const GrantMatchEmailHtml = ({ 
  firstName, 
  grants,
  viewAllUrl,
  supportEmail = 'support@highspirit.com' 
}: GrantMatchEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Grant Matches for You</title>
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
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">New Grant Matches</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 32px;">
              <h2 style="color: #0B1020; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
                New opportunities for you, ${firstName}!
              </h2>
              
              <p style="color: #5C6275; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                We found ${grants.length} new grants that match your profile. Check them out:
              </p>
              
              <!-- Grant Cards -->
              ${grants.map((grant, index) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #FFFFFF; border: 1px solid #D8DFEE; border-radius: 12px; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h3 style="color: #0B1020; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">
                            ${grant.title}
                          </h3>
                          <p style="color: #5C6275; margin: 0 0 12px 0; font-size: 14px;">
                            ${grant.funder}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 16px;">
                                <span style="display: inline-block; background-color: #FFE5B5; color: #0B1020; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
                                  ${grant.amountRange}
                                </span>
                              </td>
                              <td>
                                <span style="color: #5C6275; font-size: 12px;">
                                  Deadline: ${grant.deadline}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px;">
                          <a href="${grant.viewUrl}" style="color: #041D4A; font-size: 14px; font-weight: 600; text-decoration: none;">
                            View Grant →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `).join('')}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${viewAllUrl}" style="display: inline-block; background: linear-gradient(135deg, #041D4A 0%, #0B2E70 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      See All Matches
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

export default GrantMatchEmailHtml;
