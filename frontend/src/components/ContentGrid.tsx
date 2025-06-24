
import React from 'react';
import { ContentItem } from '@/types/content';
import { EnhancedContentGrid } from '@/components/EnhancedContentGrid';

interface ContentGridProps {
  content: ContentItem[];
  onContentClick?: (content: ContentItem) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ content, onContentClick }) => {
  return <EnhancedContentGrid content={content} onContentClick={onContentClick} />;
};
