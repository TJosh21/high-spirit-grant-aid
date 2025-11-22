import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, CheckSquare, FileStack, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationBell } from './NotificationBell';

export function Navigation() {
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const baseNavItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/grants', icon: FileText, label: 'Grants' },
    { to: '/my-applications', icon: CheckSquare, label: 'Applications' },
    { to: '/documents', icon: FileStack, label: 'Documents' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminNavItems = [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/analytics', icon: Shield, label: 'Analytics' },
    { to: '/admin/settings', icon: Shield, label: 'Settings' },
  ];

  const navItems = isAdmin 
    ? [...baseNavItems, ...adminNavItems]
    : baseNavItems;

  return (
    <nav className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-xl p-2.5 hover:bg-primary-hover transition-colors duration-200">
              <span className="text-xl font-bold text-primary-foreground">HS</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-primary leading-tight">High Spirit</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Grant Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/5 border-b-2 border-accent'
                      : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-accent' : ''}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
            <NotificationBell />
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="ml-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-xl p-2.5 hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <Button
                variant="ghost"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="justify-start text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
