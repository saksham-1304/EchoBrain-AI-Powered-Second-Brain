
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Home, BarChart3, User, Settings, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', public: true },
    { path: '/app', icon: Brain, label: 'Brain', public: false },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', public: false },
    { path: '/profile', icon: User, label: 'Profile', public: false },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10 shadow-2xl p-2">
        <div className="flex space-x-2">
          {navItems.map((item) => {
            if (!item.public && !user) return null;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="icon"
                  className={`rounded-full transition-all duration-300 ${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg scale-110' 
                      : 'hover:bg-white/30 dark:hover:bg-white/20'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
