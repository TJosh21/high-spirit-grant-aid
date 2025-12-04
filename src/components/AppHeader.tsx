import { Link } from 'react-router-dom';
import { Award, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppHeaderProps {
  showAuth?: boolean;
}

const AppHeader = ({ showAuth = true }: AppHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
          <Award className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground hidden sm:inline">High Spirit</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {showAuth && !user && (
            <Link to="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/home">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/grants">Browse Grants</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-grants">My Grants</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai-coach">AI Coach</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
