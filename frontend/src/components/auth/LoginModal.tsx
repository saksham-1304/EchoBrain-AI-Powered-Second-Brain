
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await login(email, password);
      onClose();
      setEmail('');
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showForgotPassword} onOpenChange={handleClose}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20 dark:border-slate-700/20">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <LogIn className="h-5 w-5 text-blue-600" />
              <DialogTitle>Welcome Back</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <div className="flex justify-between items-center text-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
              >
                Forgot password?
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
              Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onSwitchToSignup}
            >
              Don't have an account? Sign up
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBack={() => setShowForgotPassword(false)}
      />
    </>
  );
};
