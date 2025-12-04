// High Spirit Email Templates
// Export all email templates for easy importing

export { WelcomeEmailHtml, type WelcomeEmailProps } from './templates/WelcomeEmail';
export { GrantMatchEmailHtml, type GrantMatchEmailProps, type Grant } from './templates/GrantMatchEmail';
export { DeadlineReminderEmailHtml, type DeadlineReminderEmailProps } from './templates/DeadlineReminderEmail';
export { PasswordResetEmailHtml, type PasswordResetEmailProps } from './templates/PasswordResetEmail';
export { TrialEndingEmailHtml, type TrialEndingEmailProps } from './templates/TrialEndingEmail';

// Brand constants for email templates
export const emailBrandConfig = {
  brandName: 'High Spirit',
  tagline: 'Grant Assistant',
  companyName: 'High Spirit Financial & IT Solutions',
  supportEmail: 'support@highspirit.com',
  colors: {
    primary: '#041D4A',
    primaryHover: '#0B2E70',
    accent: '#F4AF32',
    accentSoft: '#FFE5B5',
    background: '#F4F6FB',
    surface: '#FFFFFF',
    textMain: '#0B1020',
    textSoft: '#5C6275',
    textMuted: '#8B95A5',
    border: '#D8DFEE',
    success: '#0E9F6E',
    warning: '#F59E0B',
    danger: '#E11D48',
  }
};
