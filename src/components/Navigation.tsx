import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, CheckSquare, FileStack, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/grants', icon: FileText, label: 'Grants' },
    { to: '/my-applications', icon: CheckSquare, label: 'My Applications' },
    { to: '/documents', icon: FileStack, label: 'Documents' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-royal">
              <span className="text-xl font-bold text-primary-foreground">HS</span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-bold text-foreground">High Spirit</div>
              <div className="text-xs text-muted-foreground">Grant Assistant</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="ml-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 hover:bg-secondary"
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
                    `flex items-center space-x-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
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
