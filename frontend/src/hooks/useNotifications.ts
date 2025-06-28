
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showContentAdded = useCallback((title: string) => {
    toast({
      title: 'Content Added Successfully',
      description: `"${title}" has been processed and added to your brain`,
    });
  }, [toast]);

  const showBrainShared = useCallback((isShared: boolean) => {
    toast({
      title: isShared ? 'Brain Shared' : 'Brain Privacy Restored',
      description: isShared 
        ? 'Your brain is now publicly accessible'
        : 'Your brain is now private',
    });
  }, [toast]);

  return {
    showSuccess,
    showError,
    showContentAdded,
    showBrainShared,
  };
};
