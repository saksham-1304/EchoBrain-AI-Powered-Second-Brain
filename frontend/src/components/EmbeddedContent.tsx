
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

interface EmbeddedContentProps {
  url: string;
}

export const EmbeddedContent: React.FC<EmbeddedContentProps> = ({ url }) => {
  const getEmbedContent = () => {
    if (!url || typeof url !== 'string') {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <Globe className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load content</p>
        </div>
      );
    }

    // Twitter/X
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Twitter className="h-5 w-5 text-blue-400" />
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Twitter/X Post
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">@username</p>
            <p className="text-sm mb-3">
              This is a sample Twitter/X post content. In a real implementation, 
              this would use Twitter's embed API to display the actual tweet content.
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>2:30 PM · Jun 14, 2025</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-600"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on X
              </a>
            </div>
          </div>
        </div>
      );
    }

    // LinkedIn
    if (url.includes('linkedin.com')) {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              LinkedIn Post
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <p className="font-medium text-sm">John Doe</p>
                <p className="text-xs text-muted-foreground">Software Engineer</p>
              </div>
            </div>
            <p className="text-sm mb-3">
              Exciting developments in AI technology! This is a sample LinkedIn post 
              content. Real implementation would use LinkedIn's embed capabilities.
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>2 hours ago</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-600"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on LinkedIn
              </a>
            </div>
          </div>
        </div>
      );
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const getYouTubeId = (url: string) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      const videoId = getYouTubeId(url);
      
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-4 pb-0">
            <Youtube className="h-5 w-5 text-red-500" />
            <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              YouTube Video
            </Badge>
          </div>
          
          {videoId ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-b-lg"
              />
            </div>
          ) : (
            <div className="p-4 pt-0">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">YouTube Video Preview</p>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:text-red-700 flex items-center justify-center mt-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Generic web content
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-500" />
          <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300">
            Web Article
          </Badge>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-sm mb-3">
            This is a preview of web content. In a real implementation, 
            this would show extracted content, metadata, and preview images.
          </p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Read Full Article
          </a>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {getEmbedContent()}
      </CardContent>
    </Card>
  );
};
