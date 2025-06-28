import { useState, useCallback } from 'react';
import { ContentItem } from '@/types/content';
import { useNotifications } from '@/hooks/useNotifications';
import { api } from '@/utils/api';

export const useContentManagement = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const loadUserContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getUserContent();
      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedContent = response.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt || item.createdAt),
          entities: item.entities || {
            people: [],
            topics: [],
            dates: [],
            locations: []
          },
          insights: item.insights || [],
          connections: item.connections || [],
          summary: item.summary || item.content?.substring(0, 150) + '...' || '',
          tags: item.tags || []
        }));
        setContent(transformedContent);
      }
    } catch (error: any) {
      showError('Failed to load content', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const createContent = useCallback(async (newContent: Partial<ContentItem>) => {
    setIsLoading(true);
    try {
      const contentData = {
        title: newContent.title,
        link: newContent.sourceUrl || newContent.content || '',
        type: newContent.type,
        content: newContent.content,
        tags: newContent.tags || []
      };

      const response = await api.createContent(contentData);
      if (response.success) {
        showSuccess('Content created successfully');
        // Reload content to get the latest data
        await loadUserContent();
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      showError('Failed to create content', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError, loadUserContent]);

  const deleteContent = useCallback(async (contentId: string) => {
    setIsLoading(true);
    try {
      const response = await api.deleteContent(contentId);
      if (response.success) {
        setContent(prev => prev.filter(item => item.id !== contentId));
        showSuccess('Content deleted successfully');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      showError('Failed to delete content', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const searchContent = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await api.searchContent(query);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      showError('Search failed', error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const shareContent = useCallback(async (share: boolean) => {
    setIsLoading(true);
    try {
      const response = await api.shareContent(share);
      if (response.success) {
        showSuccess(share ? 'Content shared successfully' : 'Content privacy restored');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      showError('Failed to update sharing settings', error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    content,
    setContent,
    isLoading,
    loadUserContent,
    createContent,
    deleteContent,
    searchContent,
    shareContent
  };
};