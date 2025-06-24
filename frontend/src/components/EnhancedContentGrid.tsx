
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';
import { ContentItem } from '@/types/content';
import { EnhancedContentCard } from '@/components/EnhancedContentCard';
import { ContentActionButtons } from '@/components/ContentActionButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, SortAsc, Grid, List, Sparkles } from 'lucide-react';

interface EnhancedContentGridProps {
  content: ContentItem[];
  onContentClick?: (content: ContentItem) => void;
  onEditContent?: (content: ContentItem) => void;
  onDeleteContent?: (id: string) => void;
}

type SortOption = 'date' | 'title' | 'type' | 'tags';
type ViewMode = 'grid' | 'list' | 'masonry';

export const EnhancedContentGrid: React.FC<EnhancedContentGridProps> = ({ 
  content, 
  onContentClick,
  onEditContent,
  onDeleteContent
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Sort and filter content (removed search functionality since it's handled by SmartSearchBar)
  const processedContent = useMemo(() => {
    let filtered = content;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'tags':
          return b.tags.length - a.tags.length;
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return sorted;
  }, [content, filterType, sortBy]);

  const contentTypes = useMemo(() => {
    const types = [...new Set(content.map(item => item.type))];
    return types;
  }, [content]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col space-y-4';
      case 'masonry':
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6';
    }
  };

  if (content.length === 0) {
    return (
      <motion.div 
        className="text-center py-16 animate-fade-in"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-md mx-auto">
          <motion.div 
            className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Sparkles className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            No content found
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            No content matches your search criteria. Try adjusting your filters or add some content to get started.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls - Removed search, kept only filters and view modes */}
      <motion.div 
        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-slate-700/30 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Types</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="type">Sort by Type</option>
                <option value="tags">Sort by Tags</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-900/50 rounded-lg p-1">
            {([
              { mode: 'grid', icon: Grid },
              { mode: 'list', icon: List },
              { mode: 'masonry', icon: Filter }
            ] as const).map(({ mode, icon: Icon }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters - Removed search term related filters */}
        {(filterType !== 'all' || sortBy !== 'date') && (
          <motion.div 
            className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20 dark:border-slate-700/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {filterType !== 'all' && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30">
                Type: {filterType}
              </Badge>
            )}
            {sortBy !== 'date' && (
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30">
                Sort: {sortBy}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterType('all');
                setSortBy('date');
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {processedContent.length} of {content.length} items
        </div>
      </motion.div>

      {/* Content Grid */}
      <LayoutGroup>
        <motion.div
          className={getGridClasses()}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {processedContent.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className={`${viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''} group relative`}
              >
                <div className="relative">
                  <EnhancedContentCard 
                    content={item} 
                    onContentClick={onContentClick}
                  />
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg p-1 shadow-lg border border-white/30">
                      <ContentActionButtons
                        content={item}
                        onEdit={onEditContent || (() => {})}
                        onDelete={onDeleteContent || (() => {})}
                        onView={onContentClick || (() => {})}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Load More Button (if needed) */}
      {processedContent.length > 0 && processedContent.length < content.length && (
        <motion.div 
          className="text-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800"
          >
            Load More Content
          </Button>
        </motion.div>
      )}
    </div>
  );
};
