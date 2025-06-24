
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';

interface OTPModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({ open, onClose, email, onVerify, onBack }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (open && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [open, timeLeft]);

  const handleVerify = async () => {
    if (otp.length === 6) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        onVerify(otp);
      } catch (error) {
        console.error('OTP verification failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20 dark:border-slate-700/20">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <DialogTitle>Verify Your Email</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp" className="sr-only">One-time password</Label>
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                onClick={handleVerify} 
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              
              <div className="text-center">
                {!canResend ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {timeLeft}s
                  </p>
                ) : (
                  <Button variant="ghost" onClick={handleResend} className="text-sm">
                    Resend Code
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
