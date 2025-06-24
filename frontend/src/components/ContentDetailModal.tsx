import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentItem } from '@/types/content';
import { FileText, Link, Calendar, Tag, Lightbulb, Users, MapPin, Share2, ExternalLink, Eye } from 'lucide-react';
import { EmbeddedContent } from '@/components/EmbeddedContent';
import { FileViewer } from '@/components/FileViewer';

interface ContentDetailModalProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ content, open, onClose }) => {
  const [showEmbedded, setShowEmbedded] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);

  if (!content) return null;

  const getTypeIcon = () => {
    switch (content.type) {
      case 'note':
        return <FileText className="h-5 w-5" />;
      case 'url':
      case 'article':
        return <Link className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?content=' + content.id);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20 dark:border-slate-700/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon()}
              <DialogTitle className="text-xl">{content.title}</DialogTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center text-sm text-muted-foreground flex-wrap gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Created: {content.createdAt.toLocaleDateString()}
            </div>
            {content.sourceUrl && !isFileContent() && (
              <a 
                href={content.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Source
              </a>
            )}
          </div>

          {/* Enhanced Tags */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200/50 dark:border-blue-700/50 hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{content.summary}</p>
          </div>

          {/* File Viewer Section */}
          {isFileContent() && content.sourceUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  File Content
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileViewer(!showFileViewer)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {showFileViewer ? 'Hide' : 'Show'} File Viewer
                </Button>
              </div>
              
              {showFileViewer && (
                <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <FileViewer 
                    url={content.sourceUrl}
                    fileName={content.title}
                    fileType="text/plain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Embedded Content Section */}
          {content.sourceUrl && isEmbeddableContent(content.sourceUrl) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Embedded Content</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmbedded(!showEmbedded)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {showEmbedded ? 'Hide' : 'Show'} Embedded View
                </Button>
              </div>
              
              {showEmbedded && (
                <div className="border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <EmbeddedContent url={content.sourceUrl} />
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Full Content</h3>
            <div className="bg-muted/50 p-4 rounded-lg backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
              <p className="whitespace-pre-wrap leading-relaxed">{content.content}</p>
            </div>
          </div>

          {content.insights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                AI Insights
              </h3>
              <div className="space-y-3">
                {content.insights.map((insight, index) => (
                  <div key={index} className="flex items-start p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-muted-foreground leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.entities.people.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  People
                </h4>
                <div className="flex flex-wrap gap-2">
                  {content.entities.people.map((person) => (
                    <Badge key={person} variant="outline" className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                      {person}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {content.entities.locations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {content.entities.locations.map((location) => (
                    <Badge key={location} variant="outline" className="text-xs hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {content.entities.topics.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {content.entities.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {content.entities.dates.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Dates</h4>
                <div className="flex flex-wrap gap-2">
                  {content.entities.dates.map((date) => (
                    <Badge key={date} variant="outline" className="text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer">
                      {date}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
