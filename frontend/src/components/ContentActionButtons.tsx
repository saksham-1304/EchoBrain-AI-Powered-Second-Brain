
import React from 'react';
import { motion } from 'framer-motion';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Share2, Copy } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface ContentActionButtonsProps {
  content: ContentItem;
  onEdit: (content: ContentItem) => void;
  onDelete: (id: string) => void;
  onView: (content: ContentItem) => void;
  compact?: boolean;
}

export const ContentActionButtons: React.FC<ContentActionButtonsProps> = ({
  content,
  onEdit,
  onDelete,
  onView,
  compact = false
}) => {
  const { showSuccess } = useNotifications();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href + '?content=' + content.id);
      showSuccess('Link copied to clipboard');
    } catch (error) {
      showSuccess('Content shared');
    }
  };

  const handleDuplicate = () => {
    const duplicatedContent: ContentItem = {
      ...content,
      id: crypto.randomUUID(),
      title: `${content.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onEdit(duplicatedContent);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      onDelete(content.id);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95 }
  };

  const buttons = [
    {
      icon: Eye,
      label: 'View',
      onClick: () => onView(content),
      variant: 'outline' as const,
      className: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      icon: Edit,
      label: 'Edit',
      onClick: () => onEdit(content),
      variant: 'outline' as const,
      className: 'hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick: handleDuplicate,
      variant: 'outline' as const,
      className: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: handleShare,
      variant: 'outline' as const,
      className: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      variant: 'outline' as const,
      className: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
    }
  ];

  if (compact) {
    return (
      <div className="flex space-x-1">
        {buttons.map(({ icon: Icon, label, onClick, variant, className }) => (
          <motion.div key={label} variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant={variant}
              size="sm"
              onClick={onClick}
              className={`h-8 w-8 p-0 ${className}`}
              title={label}
            >
              <Icon className="h-3 w-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ icon: Icon, label, onClick, variant, className }) => (
        <motion.div key={label} variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant={variant}
            size="sm"
            onClick={onClick}
            className={`flex items-center space-x-1 ${className}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
