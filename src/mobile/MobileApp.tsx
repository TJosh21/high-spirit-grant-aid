import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';
import { Button } from '@/components/ui/button';

export function MobileApp({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const initMobile = async () => {
      // Hide splash screen after app is ready
      await SplashScreen.hide();

      // Set status bar style
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0F172A' });
      } catch (error) {
        console.log('Status bar not available on this platform');
      }

      // Check initial network status
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        setIsOffline(!status.connected);
      });

      // Handle Android back button
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });

      // TODO: Setup push notifications
      // import { PushNotifications } from '@capacitor/push-notifications';
      // await PushNotifications.requestPermissions();
      // await PushNotifications.register();

      // TODO: Setup deep linking
      // CapacitorApp.addListener('appUrlOpen', (event) => {
      //   const slug = event.url.split('.app').pop();
      //   if (slug) {
      //     window.location.href = slug;
      //   }
      // });
    };

    initMobile();

    return () => {
      Network.removeAllListeners();
      CapacitorApp.removeAllListeners();
    };
  }, []);

  if (isOffline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
        <div className="space-y-6">
          <div className="text-6xl">📡</div>
          <h1 className="text-3xl font-bold text-white">No Internet Connection</h1>
          <p className="text-lg text-gray-300">
            Please check your internet connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#2563EB] hover:bg-[#1E40AF]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
