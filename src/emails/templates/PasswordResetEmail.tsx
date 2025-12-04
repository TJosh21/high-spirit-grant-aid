// High Spirit Password Reset Email Template

export interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiryHours?: number;
  supportEmail?: string;
}

export const PasswordResetEmailHtml = ({ 
  firstName, 
  resetUrl,
  expiryHours = 24,
  supportEmail = 'support@highspirit.com' 
}: PasswordResetEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Password Reset</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 32px;">
              <h2 style="color: #0B1020; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                Reset your password
              </h2>
              
              <p style="color: #5C6275; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                Hi ${firstName}, we received a request to reset your password for your High Spirit account. Click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #041D4A 0%, #0B2E70 100%); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Notice -->
              <div style="background-color: #F4F6FB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #5C6275; margin: 0; font-size: 14px; line-height: 1.5;">
                  <strong style="color: #0B1020;">Note:</strong> This link will expire in ${expiryHours} hours. If you didn't request a password reset, you can safely ignore this email.
                </p>
              </div>
              
              <p style="color: #5C6275; margin: 0; font-size: 14px; line-height: 1.6;">
                If you're having trouble with the button above, copy and paste this URL into your browser:
              </p>
              <p style="color: #041D4A; margin: 8px 0 0 0; font-size: 12px; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 32px 40px 32px;">
              <div style="border-top: 1px solid #D8DFEE; padding-top: 24px;">
                <p style="color: #8B95A5; margin: 0; font-size: 12px; line-height: 1.5;">
                  🔒 For your security, never share this link with anyone. High Spirit will never ask for your password via email or phone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F4F6FB; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #8B95A5; margin: 0 0 8px 0; font-size: 12px;">
                High Spirit Financial & IT Solutions
              </p>
              <p style="color: #8B95A5; margin: 0; font-size: 12px;">
                Need help? <a href="mailto:${supportEmail}" style="color: #5C6275; text-decoration: underline;">${supportEmail}</a>
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

export default PasswordResetEmailHtml;
