import { ReactNode } from 'react';

export function MobileApp({ children }: { children: ReactNode }) {
  // On web, simply render children without any Capacitor logic
  // Capacitor plugins only work in native mobile environments
  return <>{children}</>;
}