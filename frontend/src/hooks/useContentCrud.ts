
import { useState, useCallback } from 'react';
import { ContentItem } from '@/types/content';
import { useNotifications } from '@/hooks/useNotifications';

export const useContentCrud = (initialContent: ContentItem[] = []) => {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const { showSuccess, showError } = useNotifications();

  const createContent = useCallback((newContent: ContentItem) => {
    try {
      const contentWithId = {
        ...newContent,
        id: newContent.id || crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setContent(prev => [contentWithId, ...prev]);
      showSuccess('Content created successfully');
      return contentWithId;
    } catch (error) {
      showError('Failed to create content');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateContent = useCallback((id: string, updates: Partial<ContentItem>) => {
    try {
      setContent(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      ));
      showSuccess('Content updated successfully');
    } catch (error) {
      showError('Failed to update content');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteContent = useCallback((id: string) => {
    try {
      setContent(prev => prev.filter(item => item.id !== id));
      showSuccess('Content deleted successfully');
    } catch (error) {
      showError('Failed to delete content');
      throw error;
    }
  }, [showSuccess, showError]);

  const getContent = useCallback((id: string) => {
    return content.find(item => item.id === id);
  }, [content]);

  const saveContent = useCallback((contentItem: ContentItem) => {
    const existingContent = content.find(item => item.id === contentItem.id);
    if (existingContent) {
      updateContent(contentItem.id, contentItem);
    } else {
      createContent(contentItem);
    }
  }, [content, createContent, updateContent]);

  return {
    content,
    setContent,
    createContent,
    updateContent,
    deleteContent,
    getContent,
    saveContent,
  };
};
