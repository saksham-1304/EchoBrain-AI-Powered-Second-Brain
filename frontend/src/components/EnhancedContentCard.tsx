
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentItem } from '@/types/content';
import { FileText, Link, Calendar, Tag, Lightbulb, ChevronDown, ChevronUp, ExternalLink, Twitter, Linkedin, Youtube, Eye } from 'lucide-react';
import { EmbeddedContent } from './EmbeddedContent';
import { FileViewer } from './FileViewer';

interface EnhancedContentCardProps {
  content: ContentItem;
  onContentClick?: (content: ContentItem) => void;
}

export const EnhancedContentCard: React.FC<EnhancedContentCardProps> = ({ content, onContentClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmbedded, setShowEmbedded] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);

  const getTypeIcon = () => {
    switch (content.type) {
      case 'note':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'url':
      case 'article':
        return <Link className="h-4 w-4 text-green-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlatformIcon = (url?: string) => {
    if (!url) return null;
    
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return <Twitter className="h-4 w-4 text-blue-400" />;
    }
    if (url.includes('linkedin.com')) {
      return <Linkedin className="h-4 w-4 text-blue-600" />;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <Youtube className="h-4 w-4 text-red-500" />;
    }
    return <ExternalLink className="h-4 w-4 text-gray-500" />;
  };

  const isEmbeddableContent = (url?: string) => {
    if (!url) return false;
    return url.includes('twitter.com') || url.includes('x.com') || 
           url.includes('linkedin.com') || url.includes('youtube.com') || 
           url.includes('youtu.be');
  };

  const isFileContent = () => {
    return content.type === 'pdf' && content.sourceUrl && content.sourceUrl.startsWith('blob:');
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/30 dark:border-slate-700/30 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-slate-800/90 cursor-pointer overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {getTypeIcon()}
            <h3 
              className="font-semibold text-lg leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2"
              onClick={() => onContentClick?.(content)}
            >
              {content.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {content.sourceUrl && getPlatformIcon(content.sourceUrl)}
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {content.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isExpanded ? content.summary : truncateText(content.summary, 120)}
        </p>

        {content.summary.length > 120 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Read more
              </>
            )}
          </Button>
        )}

        {/* Enhanced Tags */}
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Tag className="h-3 w-3 text-muted-foreground mt-1 mr-1" />
            {content.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200/50 dark:border-blue-700/50 hover:scale-105 transition-transform duration-200 hover:shadow-md"
              >
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* AI Insights Preview */}
        {content.insights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-100/50 dark:border-blue-800/30">
            <div className="flex items-center mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Insight</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {truncateText(content.insights[0], 80)}
            </p>
          </div>
        )}

        {/* Entity Information */}
        <div className="flex flex-wrap gap-2 text-xs">
          {content.entities.people.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">People:</span>
              <span className="font-medium">{content.entities.people.slice(0, 2).join(', ')}</span>
              {content.entities.people.length > 2 && <span className="text-muted-foreground">+{content.entities.people.length - 2}</span>}
            </div>
          )}
          {content.entities.locations.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Places:</span>
              <span className="font-medium">{content.entities.locations.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>

        {/* File Viewer for uploaded files */}
        {isFileContent() && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFileViewer(!showFileViewer)}
              className="w-full justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showFileViewer ? 'Hide' : 'View'} File Content
            </Button>
            
            {showFileViewer && content.sourceUrl && (
              <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50">
                <FileViewer 
                  url={content.sourceUrl}
                  fileName={content.title}
                  fileType="text/plain"
                  compact
                />
              </div>
            )}
          </div>
        )}

        {/* Embedded Content Preview */}
        {content.sourceUrl && isEmbeddableContent(content.sourceUrl) && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmbedded(!showEmbedded)}
              className="w-full justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {showEmbedded ? 'Hide' : 'Show'} Embedded Content
              {getPlatformIcon(content.sourceUrl)}
            </Button>
            
            {showEmbedded && (
              <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50">
                <EmbeddedContent url={content.sourceUrl} />
              </div>
            )}
          </div>
        )}

        {/* Source Link */}
        {content.sourceUrl && !isFileContent() && (
          <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
            <a
              href={content.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center hover:underline"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Original
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
