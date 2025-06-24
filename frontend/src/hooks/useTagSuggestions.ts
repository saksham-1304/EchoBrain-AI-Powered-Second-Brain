
import { useState, useEffect } from 'react';

const POPULAR_TAGS = [
  'AI', 'Technology', 'Business', 'Research', 'Innovation', 'Strategy',
  'Machine Learning', 'Data Science', 'Marketing', 'Product', 'Design',
  'Development', 'Finance', 'Health', 'Education', 'Science', 'Management',
  'Leadership', 'Startup', 'Investment', 'Analytics', 'Automation',
  'Digital Transformation', 'Cloud Computing', 'Security', 'Programming'
];

export const useTagSuggestions = (input: string, existingTags: string[] = []) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!input.trim()) {
      setSuggestions(POPULAR_TAGS.filter(tag => !existingTags.includes(tag)).slice(0, 10));
      return;
    }

    const filtered = POPULAR_TAGS.filter(tag => 
      tag.toLowerCase().includes(input.toLowerCase()) && 
      !existingTags.includes(tag)
    );

    setSuggestions(filtered.slice(0, 10));
  }, [input, existingTags]);

  return suggestions;
};
