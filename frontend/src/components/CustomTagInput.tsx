
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, Plus, Search } from 'lucide-react';
import { useTagSuggestions } from '@/hooks/useTagSuggestions';

interface CustomTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const CustomTagInput: React.FC<CustomTagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  className = ""
}) => {
  const [newTag, setNewTag] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const suggestions = useTagSuggestions(newTag, tags);

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setNewTag('');
      setIsCommandOpen(false);
    }
  }, [tags, onTagsChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag);
    }
    // Removed Ctrl+K functionality to avoid conflict with semantic search
  }, [newTag, addTag]);

  const handleSearchButtonClick = () => {
    setIsCommandOpen(true);
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border-blue-200/50 dark:border-blue-700/50"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="bg-white/20 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
            />
          </div>
          <Button 
            type="button"
            onClick={() => addTag(newTag)} 
            variant="outline" 
            size="sm"
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={handleSearchButtonClick}
            variant="outline"
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput 
          placeholder="Search tags..." 
          value={newTag}
          onValueChange={setNewTag}
        />
        <CommandList>
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion}
                onSelect={() => addTag(suggestion)}
                className="cursor-pointer"
              >
                {suggestion}
              </CommandItem>
            ))}
          </CommandGroup>
          {newTag.trim() && !suggestions.includes(newTag.trim()) && (
            <CommandGroup heading="Create New">
              <CommandItem
                onSelect={() => addTag(newTag)}
                className="cursor-pointer"
              >
                Create "{newTag.trim()}"
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
