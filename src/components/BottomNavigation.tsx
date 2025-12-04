import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, ClipboardList, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom md:hidden"
      style={{ background: 'linear-gradient(180deg, hsl(220 90% 15%) 0%, hsl(220 90% 12%) 100%)' }}
    >
      <div className="flex justify-around items-center h-18 px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/home' && location.pathname === '/dashboard');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 py-2 px-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-1 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(43 90% 58% / 0.15) 0%, hsl(43 90% 58% / 0.05) 100%)' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                className="relative z-10 flex flex-col items-center"
                whileTap={{ scale: 0.95 }}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  isActive && "bg-accent/20"
                )}>
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive 
                        ? "text-accent" 
                        : "text-white/60"
                    )} 
                  />
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium mt-1 transition-all duration-300",
                    isActive 
                      ? "text-accent" 
                      : "text-white/60"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
