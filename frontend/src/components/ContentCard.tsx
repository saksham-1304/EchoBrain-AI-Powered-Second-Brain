
import React, { useState } from 'react';
import { FileText, Link, Calendar, Tag, Lightbulb, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentItem } from '@/types/content';

interface ContentCardProps {
  content: ContentItem;
  onContentClick?: (content: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onContentClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (content.type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'url':
      case 'article':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (content.type) {
      case 'note':
        return 'bg-blue-500';
      case 'url':
      case 'article':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCardClick = () => {
    if (onContentClick) {
      onContentClick(content);
    }
  };

  return (
    <Card 
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${getTypeColor()} text-white`}>
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {content.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {content.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {content.summary}
        </p>
        
        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="flex items-center mb-3">
            <Tag className="h-3 w-3 mr-2 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {content.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {content.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{content.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* AI Insights Preview */}
        {content.insights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded-lg mb-3">
            <div className="flex items-center mb-2">
              <Lightbulb className="h-3 w-3 mr-2 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Insights</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 line-clamp-2">
              {content.insights[0]}
            </p>
          </div>
        )}
        
        {/* Entities */}
        <div className="space-y-2 mb-4">
          {content.entities.people.length > 0 && (
            <div className="flex items-center text-xs">
              <Users className="h-3 w-3 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                {content.entities.people.slice(0, 2).join(', ')}
                {content.entities.people.length > 2 && ` +${content.entities.people.length - 2}`}
              </span>
            </div>
          )}
          
          {content.entities.locations.length > 0 && (
            <div className="flex items-center text-xs">
              <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                {content.entities.locations.slice(0, 2).join(', ')}
                {content.entities.locations.length > 2 && ` +${content.entities.locations.length - 2}`}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full"
        >
          {isExpanded ? 'Show Less' : 'View Details'}
        </Button>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
            <div>
              <h4 className="font-medium text-sm mb-2">Full Summary</h4>
              <p className="text-sm text-muted-foreground">{content.summary}</p>
            </div>
            
            {content.insights.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  All Insights
                </h4>
                <ul className="space-y-1">
                  {content.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm mb-2">All Tags</h4>
              <div className="flex flex-wrap gap-1">
                {content.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
