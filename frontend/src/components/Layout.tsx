import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from './theme-provider';
import { 
  Home, 
  Gamepad2, 
  MessageSquare, 
  Users, 
  Trophy, 
  Settings, 
  User, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Forums', href: '/forums', icon: Users },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Wall of Gamers', href: '/wall-of-gamers', icon: Users },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin', href: '/admin', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link to="/" className="text-2xl font-bold text-primary">
              GameCom
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <Link to="/profile" className="block">
              <div className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {user?.level}
                  </p>
                </div>
              </div>
            </Link>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 mr-3" />
              ) : (
                <Moon className="w-4 h-4 mr-3" />
              )}
              Toggle theme
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 