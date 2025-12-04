import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, ClipboardList, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user ? [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/grants', icon: Search, label: 'Grants' },
    { path: '/ai-coach', icon: Sparkles, label: 'AI Coach' },
    { path: '/my-grants', icon: ClipboardList, label: 'Tracker' },
    { path: '/profile', icon: User, label: 'Profile' },
  ] : [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/grants', icon: Search, label: 'Grants' },
    { path: '/auth', icon: User, label: 'Sign In' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/home' && location.pathname === '/dashboard');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
