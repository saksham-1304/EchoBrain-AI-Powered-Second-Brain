
import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, Grid, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ContentItem } from '@/types/content';

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  content: ContentItem[];
}

const SMART_QUERIES = [
  { label: 'Recent uploads', query: 'recent uploads', description: 'Content added in the last 7 days' },
  { label: 'AI insights', query: 'ai insights', description: 'Content with AI-generated insights' },
  { label: 'Most connected', query: 'most connected', description: 'Content with many tags' },
  { label: 'Untagged', query: 'untagged', description: 'Content without tags' },
];

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  value,
  onChange,
  content
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMode(true);
        setShowSuggestions(true);
        inputRef.current?.focus();
      }
      
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setIsCommandMode(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsCommandMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 || isCommandMode);
  };

  const handleSuggestionClick = (query: string) => {
    onChange(query);
    setShowSuggestions(false);
    setIsCommandMode(false);
  };

  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    setIsCommandMode(false);
  };

  const getFilteredSuggestions = () => {
    if (!value) return SMART_QUERIES;
    
    const query = value.toLowerCase();
    return SMART_QUERIES.filter(suggestion => 
      suggestion.label.toLowerCase().includes(query) ||
      suggestion.query.toLowerCase().includes(query)
    );
  };

  const getRecentTags = () => {
    const allTags = content.flatMap(item => item.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([tag]) => tag);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search your brain... (Ctrl+K for quick search)"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className={`pl-10 pr-20 py-3 text-base bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/30 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 ${
            isCommandMode ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {showSuggestions && (
        <Card className="absolute top-full mt-2 w-full z-50 p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-2xl animate-in slide-in-from-top-2">
          {isCommandMode && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Command className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Search</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use semantic search to find content by meaning, not just keywords
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Smart Queries */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Smart Queries
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getFilteredSuggestions().map((suggestion) => (
                  <button
                    key={suggestion.query}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className="text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {suggestion.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Popular Tags */}
            {getRecentTags().length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Popular Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getRecentTags().map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      onClick={() => handleSuggestionClick(`tag:${tag}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Searching {content.length} items</span>
              <span>Press Esc to close</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
