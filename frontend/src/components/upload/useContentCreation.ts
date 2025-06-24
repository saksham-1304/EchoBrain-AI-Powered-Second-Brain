
import { useState } from 'react';
import { ContentItem } from '@/types/content';

export const useContentCreation = (onContentAdded: (content: ContentItem) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const createContentItem = (baseContent: Partial<ContentItem>): ContentItem => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
    entities: {
      people: [],
      topics: [],
      dates: [],
      locations: []
    },
    connections: [],
    ...baseContent
  } as ContentItem);

  const handleNoteSubmit = async () => {
    if (!title.trim() || !noteContent.trim()) return;
    
    setIsLoading(true);
    
    try {
      const newContent = createContentItem({
        title: title.trim(),
        type: 'note',
        content: noteContent.trim(),
        summary: noteContent.trim().substring(0, 150) + (noteContent.length > 150 ? '...' : ''),
        tags: tags.length > 0 ? tags : ['note'],
        insights: [`Created: ${new Date().toLocaleDateString()}`],
        category: 'notes'
      });
      
      console.log('Created note content:', newContent);
      onContentAdded(newContent);
      
      // Reset form
      setTitle('');
      setNoteContent('');
      setTags([]);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!title.trim() || !url.trim()) return;
    
    setIsLoading(true);
    
    try {
      const newContent = createContentItem({
        title: title.trim(),
        type: 'url',
        content: url.trim(),
        summary: `Web content from: ${url.trim()}`,
        tags: tags.length > 0 ? tags : ['web', 'article'],
        insights: [`Source: ${new URL(url).hostname}`],
        category: 'web',
        sourceUrl: url.trim()
      });
      
      console.log('Created URL content:', newContent);
      onContentAdded(newContent);
      
      // Reset form
      setTitle('');
      setUrl('');
      setTags([]);
    } catch (error) {
      console.error('Error saving URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelection = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    
    try {
      for (const file of selectedFiles) {
        const newContent = createContentItem({
          title: file.name,
          type: 'pdf',
          content: `File uploaded: ${file.name}`,
          summary: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          tags: tags.length > 0 ? tags : ['uploaded'],
          insights: [`File size: ${(file.size / 1024).toFixed(1)} KB`],
          category: 'uploads'
        });
        
        console.log('Created file content:', newContent);
        onContentAdded(newContent);
      }
      
      // Reset form
      setSelectedFiles([]);
      setTags([]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return {
    isLoading,
    title,
    setTitle,
    noteContent,
    setNoteContent,
    url,
    setUrl,
    tags,
    setTags,
    selectedFiles,
    handleNoteSubmit,
    handleUrlSubmit,
    handleFileSelection,
    handleFileUpload,
    removeSelectedFile
  };
};
