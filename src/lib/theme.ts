// High Spirit Design System - Design Tokens
// Central theme configuration for the High Spirit Grant Assistant

export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: '#041D4A',   // Royal Blue - main brand color
      soft: '#0B2E70',      // Slightly lighter royal blue
      hover: '#0C3275',     // Hover state
      light: '#1A4080',     // Lighter variant
    },
    accent: {
      DEFAULT: '#F4AF32',   // Gold - accent color
      soft: '#FFE5B5',      // Soft gold for backgrounds
      hover: '#E5A02D',     // Gold hover state
      glow: '#FFD980',      // Glow effect
    },
    // Background colors
    background: {
      DEFAULT: '#F4F6FB',   // Soft gray-blue background
      surface: '#FFFFFF',   // White surface/cards
      surfaceAlt: '#EDF1FA', // Alternative surface
    },
    // Border colors
    border: {
      subtle: '#D8DFEE',    // Subtle border
      DEFAULT: '#E2E8F0',   // Default border
    },
    // Text colors
    text: {
      main: '#0B1020',      // Main text color
      soft: '#5C6275',      // Soft/muted text
      muted: '#8B95A5',     // More muted text
    },
    // Status colors
    status: {
      success: '#0E9F6E',   // Success green
      warning: '#F59E0B',   // Warning amber
      danger: '#E11D48',    // Danger red
      info: '#2563EB',      // Info blue
    },
  },
  
  // Border radius values
  radius: {
    sm: 8,      // 0.5rem
    md: 12,     // 0.75rem
    lg: 16,     // 1rem
    xl: 20,     // 1.25rem
    '2xl': 24,  // 1.5rem
    '3xl': 32,  // 2rem
    pill: 9999, // Pill shape
  },
  
  // Shadow definitions
  shadows: {
    soft: '0 2px 8px 0 rgba(4, 29, 74, 0.04), 0 1px 3px 0 rgba(4, 29, 74, 0.02)',
    medium: '0 8px 24px 0 rgba(4, 29, 74, 0.08), 0 4px 8px 0 rgba(4, 29, 74, 0.04)',
    strong: '0 16px 40px 0 rgba(4, 29, 74, 0.12), 0 6px 12px 0 rgba(4, 29, 74, 0.06)',
    glow: {
      gold: '0 0 40px 0 rgba(244, 175, 50, 0.3)',
      blue: '0 0 40px 0 rgba(4, 29, 74, 0.2)',
    },
  },
  
  // Spacing scale (in pixels)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  
  // Typography variants
  typography: {
    display: {
      fontSize: '2.5rem',   // 40px
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h1: {
      fontSize: '2rem',     // 32px
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.5rem',   // 24px
      lineHeight: 1.3,
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.25rem',  // 20px
      lineHeight: 1.4,
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.4,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle: {
      fontSize: '1rem',     // 16px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body: {
      fontSize: '1rem',     // 16px
      lineHeight: 1.6,
      fontWeight: 400,
    },
    bodyBold: {
      fontSize: '1rem',     // 16px
      lineHeight: 1.6,
      fontWeight: 600,
    },
    caption: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      fontWeight: 400,
    },
    overline: {
      fontSize: '0.75rem',  // 12px
      lineHeight: 1.5,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
  },
  
  // Transition definitions
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
  },
} as const;

// Type exports for TypeScript support
export type ThemeColors = typeof theme.colors;
export type ThemeRadius = typeof theme.radius;
export type ThemeShadows = typeof theme.shadows;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
