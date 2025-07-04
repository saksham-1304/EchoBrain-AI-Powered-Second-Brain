import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { EnhancedContentGrid } from '@/components/EnhancedContentGrid';
import { SmartSearchBar } from '@/components/SmartSearchBar';
import { ContentDetailModal } from '@/components/ContentDetailModal';
import { ContentCrudModal } from '@/components/ContentCrudModal';
import { AppSidebar } from '@/components/AppSidebar';
import { ContentItem } from '@/types/content';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useContentManagement } from '@/hooks/useContentManagement';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { user } = useAuth();
  const { showContentAdded, showBrainShared } = useNotifications();
  const navigate = useNavigate();
  const hasInitialLoadRef = useRef(false);

  const {
    content,
    isLoading,
    loadUserContent,
    createContent,
    deleteContent,
    shareContent
  } = useContentManagement();

  useEffect(() => {
    console.log('[Index] useEffect triggered - user:', !!user, 'hasInitialLoad:', hasInitialLoadRef.current);
    
    if (!user) {
      navigate('/');
      return;
    }
    
    // Only load content once when user is available and hasn't been loaded yet
    if (user && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      console.log('[Index] Loading initial content');
      loadUserContent();
    }
  }, [user, navigate]); // Remove loadUserContent from dependencies to prevent infinite loop

  const handleNewContent = async (newItem: ContentItem) => {
    try {
      await createContent(newItem);
      showContentAdded(newItem.title);
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleContentClick = (item: ContentItem) => {
    setSelectedContent(item);
  };

  const handleEditContent = (item: ContentItem) => {
    setEditingContent(item);
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      await deleteContent(id);
    }
  };

  const handleSaveContent = async (contentItem: ContentItem) => {
    try {
      if (editingContent) {
        // For now, we'll just close the modal since update isn't implemented
        setEditingContent(null);
      } else {
        await createContent(contentItem);
      }
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleToggleShare = async () => {
    const newSharedState = !isShared;
    try {
      const result = await shareContent(newSharedState);
      if (result) {
        setIsShared(newSharedState);
        showBrainShared(newSharedState);
      }
    } catch (error) {
      console.error('Failed to toggle sharing:', error);
    }
  };

  const filteredContent = content.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Handle tag-specific search
    if (query.startsWith('tag:')) {
      const tagQuery = query.replace('tag:', '');
      return item.tags.some(tag => tag.toLowerCase().includes(tagQuery));
    }
    
    // Handle smart queries
    if (query.includes('recent uploads')) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return item.createdAt > weekAgo;
    }
    
    if (query.includes('ai insights')) {
      return item.insights.length > 0;
    }
    
    if (query.includes('most connected')) {
      return item.tags.length > 2;
    }
    
    if (query.includes('untagged')) {
      return item.tags.length === 0;
    }
    
    // Default search
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <SidebarProvider>
      <motion.div 
        className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <AppSidebar 
          contentCount={content.length}
          isShared={isShared}
          onToggleShare={handleToggleShare}
        />
        
        <SidebarInset className="flex-1">
          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6"
              variants={sectionVariants}
            >
              <div className="flex items-center space-x-2">
                <SidebarTrigger className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" />
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <Header isShared={isShared} onToggleShare={handleToggleShare} />
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                size="sm"
                disabled={isLoading}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Content</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </motion.div>
            
            <div className="space-y-4 sm:space-y-6">
              <motion.div variants={sectionVariants}>
                <SmartSearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  content={content}
                />
              </motion.div>
              
              {isLoading && content.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-muted-foreground">Loading your content...</p>
                  </div>
                </div>
              ) : content.length === 0 ? (
                <motion.div 
                  className="animate-scale-in"
                  variants={sectionVariants}
                >
                  <UploadZone onContentAdded={handleNewContent} />
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
                  <div className="xl:col-span-3">
                    <motion.div 
                      className="animate-fade-in"
                      variants={sectionVariants}
                    >
                      <EnhancedContentGrid 
                        content={filteredContent} 
                        onContentClick={handleContentClick}
                        onEditContent={handleEditContent}
                        onDeleteContent={handleDeleteContent}
                      />
                    </motion.div>
                  </div>
                  <div className="xl:col-span-1">
                    <motion.div 
                      className="animate-slide-in-right"
                      variants={sectionVariants}
                    >
                      <UploadZone 
                        onContentAdded={handleNewContent} 
                        compact 
                        showCreateButton={true}
                      />
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </motion.div>

      <ContentDetailModal 
        content={selectedContent}
        open={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      />

      <ContentCrudModal
        content={editingContent}
        open={showCreateModal || !!editingContent}
        onClose={() => {
          setShowCreateModal(false);
          setEditingContent(null);
        }}
        onSave={handleSaveContent}
      />
    </SidebarProvider>
  );
};

export default Index;