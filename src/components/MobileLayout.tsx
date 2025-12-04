import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

const MobileLayout = ({ children, hideBottomNav = false }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className={hideBottomNav ? "" : "pb-20 md:pb-0"}>
        {children}
      </main>
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
