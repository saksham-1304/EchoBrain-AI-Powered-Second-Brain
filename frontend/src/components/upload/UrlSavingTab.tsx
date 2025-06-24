
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomTagInput } from '@/components/CustomTagInput';

interface UrlSavingTabProps {
  title: string;
  setTitle: (title: string) => void;
  url: string;
  setUrl: (url: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const UrlSavingTab: React.FC<UrlSavingTabProps> = ({
  title,
  setTitle,
  url,
  setUrl,
  tags,
  setTags,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Article or page title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
      />
      <Input
        placeholder="https://example.com/article"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
      />
      <CustomTagInput
        tags={tags}
        onTagsChange={setTags}
        placeholder="Add tags to categorize this content..."
      />
      <Button
        onClick={onSubmit}
        disabled={!title.trim() || !url.trim() || isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
      >
        {isLoading ? 'Saving...' : 'Save URL'}
      </Button>
    </div>
  );
};
