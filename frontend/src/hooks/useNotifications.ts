
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: 'destructive',
    });
  };

  const showContentAdded = (title: string) => {
    toast({
      title: 'Content Added Successfully',
      description: `"${title}" has been processed and added to your brain`,
    });
  };

  const showBrainShared = (isShared: boolean) => {
    toast({
      title: isShared ? 'Brain Shared' : 'Brain Privacy Restored',
      description: isShared 
        ? 'Your brain is now publicly accessible'
        : 'Your brain is now private',
    });
  };

  return {
    showSuccess,
    showError,
    showContentAdded,
    showBrainShared,
  };
};
