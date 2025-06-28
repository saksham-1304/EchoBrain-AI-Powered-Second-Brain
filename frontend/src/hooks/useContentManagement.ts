import { useState, useCallback } from 'react';
import { ContentItem } from '@/types/content';
import { useNotifications } from '@/hooks/useNotifications';
import { api } from '@/utils/api';

// Enhanced content management with caching and optimistic updates
export const useContentManagement = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const { showSuccess, showError } = useNotifications();

  // Clear error when starting new operations
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadUserContent = useCallback(async (page: number = 1, limit: number = 20, append: boolean = false) => {
    if (!append) {
      setIsLoading(true);
    }
    clearError();
    
    try {
      const response = await api.getUserContent(page, limit);
      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedContent = response.data.contents.map((item: any) => ({
          ...item,
          id: item._id || item.id,
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

        if (append) {
          setContent(prev => [...prev, ...transformedContent]);
        } else {
          setContent(transformedContent);
        }

        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load content';
      setError(errorMessage);
      showError('Failed to load content', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError, clearError]);

  const createContent = useCallback(async (newContent: Partial<ContentItem>) => {
    setIsLoading(true);
    clearError();
    
    // Optimistic update
    const optimisticContent: ContentItem = {
      id: `temp-${Date.now()}`,
      title: newContent.title || '',
      type: newContent.type || 'note',
      content: newContent.content || '',
      summary: newContent.summary || newContent.content?.substring(0, 150) + '...' || '',
      tags: newContent.tags || [],
      category: newContent.category,
      entities: {
        people: [],
        topics: [],
        dates: [],
        locations: []
      },
      insights: [],
      connections: [],
      sourceUrl: newContent.sourceUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      isShared: false
    };

    // Add optimistic content to the beginning of the list
    setContent(prev => [optimisticContent, ...prev]);

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
        
        // Replace optimistic content with real content
        setContent(prev => prev.map(item => 
          item.id === optimisticContent.id 
            ? { ...optimisticContent, id: response.data.id, ...response.data }
            : item
        ));
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Remove optimistic content on error
      setContent(prev => prev.filter(item => item.id !== optimisticContent.id));
      
      const errorMessage = error.message || 'Failed to create content';
      setError(errorMessage);
      showError('Failed to create content', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError, clearError]);

  const deleteContent = useCallback(async (contentId: string) => {
    clearError();
    
    // Optimistic update
    const originalContent = content.find(item => item.id === contentId);
    setContent(prev => prev.filter(item => item.id !== contentId));

    try {
      const response = await api.deleteContent(contentId);
      if (response.success) {
        showSuccess('Content deleted successfully');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Restore content on error
      if (originalContent) {
        setContent(prev => [originalContent, ...prev]);
      }
      
      const errorMessage = error.message || 'Failed to delete content';
      setError(errorMessage);
      showError('Failed to delete content', errorMessage);
    }
  }, [content, showSuccess, showError, clearError]);

  const searchContent = useCallback(async (query: string, page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await api.searchContent(query, page, limit);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Search failed';
      setError(errorMessage);
      showError('Search failed', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showError, clearError]);

  const shareContent = useCallback(async (share: boolean) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await api.shareContent(share);
      if (response.success) {
        showSuccess(share ? 'Content shared successfully' : 'Content privacy restored');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update sharing settings';
      setError(errorMessage);
      showError('Failed to update sharing settings', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError, clearError]);

  // Load more content for pagination
  const loadMore = useCallback(async () => {
    if (pagination.hasNext && !isLoading) {
      await loadUserContent(pagination.page + 1, pagination.limit, true);
    }
  }, [pagination, isLoading, loadUserContent]);

  // Refresh content
  const refresh = useCallback(async () => {
    await loadUserContent(1, pagination.limit, false);
  }, [loadUserContent, pagination.limit]);

  return {
    content,
    setContent,
    isLoading,
    error,
    pagination,
    loadUserContent,
    createContent,
    deleteContent,
    searchContent,
    shareContent,
    loadMore,
    refresh,
    clearError
  };
};