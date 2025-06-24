
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CustomTagInput } from '@/components/CustomTagInput';

interface NoteCreationTabProps {
  title: string;
  setTitle: (title: string) => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const NoteCreationTab: React.FC<NoteCreationTabProps> = ({
  title,
  setTitle,
  noteContent,
  setNoteContent,
  tags,
  setTags,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
      />
      <Textarea
        placeholder="Write your note here..."
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        className="min-h-[150px] bg-white/80 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
      />
      <CustomTagInput
        tags={tags}
        onTagsChange={setTags}
        placeholder="Add tags to organize your note..."
      />
      <Button
        onClick={onSubmit}
        disabled={!title.trim() || !noteContent.trim() || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        {isLoading ? 'Creating...' : 'Create Note'}
      </Button>
    </div>
  );
};
