
import React, { useState } from 'react';
import { Brain, Sparkles, Moon, Sun, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isShared?: boolean;
  onToggleShare?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="relative hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-purple-100">
              EchoBrain
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">AI-powered knowledge base</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 px-3 sm:px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">AI Powered</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:scale-110 transition-transform duration-300"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm">
                <DropdownMenuItem onClick={logout} className="hover:bg-accent/50 transition-colors duration-200">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                className="hover:scale-105 transition-transform duration-300"
                size="sm"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">In</span>
              </Button>
              <Button 
                onClick={() => setShowSignup(true)}
                className="hover:scale-105 transition-transform duration-300"
                size="sm"
              >
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Up</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />

      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    </>
  );
};
