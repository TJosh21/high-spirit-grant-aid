import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.highspirit.grantassistant',
  appName: 'High Spirit Grant Assistant',
  webDir: 'dist',
  
  // PRODUCTION CONFIGURATION
  // This points to your live Lovable app
  server: {
    url: 'https://68d3aecb-93c8-4e4e-898d-3882414185c4.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F172A'
    },
    App: {
      // Handle Android back button
    },
    Network: {
      // Monitor connectivity
    }
  },

  // iOS specific configuration
  ios: {
    contentInset: 'always',
    scheme: 'highspirit'
  },

  // Android specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
