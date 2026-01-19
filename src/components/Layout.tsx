import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Moon, Sun } from 'lucide-react';
import noteitLogo from '@/assets/noteit-logo.png';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
                  <img 
                    src={noteitLogo} 
                    alt="Noteit" 
                    className="h-9 w-auto"
                  />
                </Link>
                {title && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground font-medium">{title}</span>
                  </>
                )}
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/settings')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
