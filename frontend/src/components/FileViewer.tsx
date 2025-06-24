import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Video, Music, Download, Eye, X, Code, FileType } from 'lucide-react';

interface FileViewerProps {
  url: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  onClose?: () => void;
  compact?: boolean;
}

export const FileViewer: React.FC<FileViewerProps> = ({ 
  url, 
  fileName, 
  fileType, 
  fileSize,
  onClose,
  compact = false 
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actualFileType, setActualFileType] = useState<string>(fileType || '');
  const [previewError, setPreviewError] = useState<string>('');

  // Enhanced file type detection based on filename extension
  const detectFileType = (filename: string, mimeType?: string) => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    // Text and code files
    const textExtensions = ['txt', 'md', 'readme'];
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'sql', 'sh'];
    
    if (textExtensions.includes(ext)) return 'text/plain';
    if (codeExtensions.includes(ext)) return `text/${ext}`;
    if (ext === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].includes(ext)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (['ppt', 'pptx'].includes(ext)) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return `image/${ext}`;
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) return `video/${ext}`;
    if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return `audio/${ext}`;
    
    return mimeType || 'application/octet-stream';
  };

  useEffect(() => {
    const detectedType = detectFileType(fileName, fileType);
    setActualFileType(detectedType);
  }, [fileName, fileType]);

  const getFileIcon = () => {
    if (actualFileType.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
    if (actualFileType.startsWith('video/')) return <Video className="h-5 w-5 text-red-500" />;
    if (actualFileType.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />;
    if (actualFileType === 'application/pdf') return <FileType className="h-5 w-5 text-red-500" />;
    if (actualFileType.includes('document') || actualFileType.includes('word') || fileName.toLowerCase().includes('.doc')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (actualFileType.includes('presentation') || fileName.toLowerCase().includes('.ppt')) {
      return <FileText className="h-5 w-5 text-orange-600" />;
    }
    if (isCodeFile()) return <Code className="h-5 w-5 text-green-600" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isCodeFile = () => {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml', '.sql', '.sh', '.md'];
    return codeExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) ||
           actualFileType.includes('javascript') || actualFileType.includes('json') || actualFileType.includes('xml') ||
           actualFileType.startsWith('text/');
  };

  const isTextFile = () => {
    return actualFileType.startsWith('text/') || 
           fileName.toLowerCase().endsWith('.txt') ||
           fileName.toLowerCase().endsWith('.md') ||
           isCodeFile();
  };

  const getLanguageFromFileName = () => {
    const ext = fileName.toLowerCase().split('.').pop();
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'bash',
      'md': 'markdown',
      'txt': 'text'
    };
    return langMap[ext || ''] || 'text';
  };

  const loadTextContent = async () => {
    if (!isTextFile() && !actualFileType.includes('json') && !actualFileType.includes('xml')) return;
    
    setIsLoading(true);
    setPreviewError('');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error('Failed to load file content:', error);
      setPreviewError('Failed to load file content. The file may be binary or corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (actualFileType) {
      loadTextContent();
    }
  }, [url, actualFileType]);

  const renderFileContent = () => {
    // Images
    if (actualFileType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img 
            src={url} 
            alt={fileName}
            className="max-w-full max-h-96 rounded-lg shadow-lg object-contain"
            onError={(e) => {
              console.error('Image failed to load:', url);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Videos
    if (actualFileType.startsWith('video/')) {
      return (
        <div className="flex justify-center">
          <video 
            controls 
            className="max-w-full max-h-96 rounded-lg shadow-lg"
            preload="metadata"
          >
            <source src={url} type={actualFileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio
    if (actualFileType.startsWith('audio/')) {
      return (
        <div className="flex justify-center">
          <audio 
            controls 
            className="w-full max-w-md"
            preload="metadata"
          >
            <source src={url} type={actualFileType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // PDF Files - Improved handling for blob URLs
    if (actualFileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="w-full space-y-3">
          <div className="bg-muted/30 p-2 sm:p-4 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm">
            <div className="w-full">
              {url.startsWith('blob:') ? (
                <iframe
                  src={url}
                  className="w-full h-64 sm:h-96 rounded border-0"
                  title={fileName}
                  onError={() => setPreviewError('PDF preview not available')}
                />
              ) : (
                <object
                  data={url}
                  type="application/pdf"
                  className="w-full h-64 sm:h-96 rounded border-0"
                  title={fileName}
                >
                  <div className="text-center py-8">
                    <FileType className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-muted-foreground mb-4">PDF preview not available in this browser</p>
                    <Button variant="outline" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Open PDF
                      </a>
                    </Button>
                  </div>
                </object>
              )}
            </div>
          </div>
          <div className="text-center space-x-2">
            <Button variant="outline" asChild size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Open in New Tab</span>
                <span className="sm:hidden">Open</span>
              </a>
            </Button>
            <Button variant="outline" asChild size="sm">
              <a href={url} download={fileName}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </a>
            </Button>
          </div>
        </div>
      );
    }

    // Office Documents (Word, PowerPoint, Excel)
    if (actualFileType.includes('document') || actualFileType.includes('word') || 
        actualFileType.includes('presentation') || actualFileType.includes('spreadsheet') ||
        fileName.toLowerCase().match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/)) {
      
      const getDocumentType = () => {
        if (actualFileType.includes('presentation') || fileName.toLowerCase().includes('.ppt')) {
          return { type: 'PowerPoint Presentation', icon: 'text-orange-600', color: 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30' };
        }
        if (actualFileType.includes('spreadsheet') || fileName.toLowerCase().includes('.xls')) {
          return { type: 'Excel Spreadsheet', icon: 'text-green-600', color: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' };
        }
        return { type: 'Word Document', icon: 'text-blue-600', color: 'from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30' };
      };

      const docInfo = getDocumentType();
      
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 p-2 sm:p-4 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              className="w-full h-64 sm:h-96 rounded border-0"
              title={fileName}
              onError={() => setPreviewError('Office Online preview failed')}
            />
            
            {previewError && (
              <div className="text-center space-y-4 p-4 sm:p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${docInfo.color} rounded-full flex items-center justify-center mx-auto`}>
                  <FileText className={`h-8 w-8 ${docInfo.icon}`} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">{docInfo.type}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview not available. Please download to view the document.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
                    <Button variant="outline" asChild size="sm">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Try to Open
                      </a>
                    </Button>
                    <Button variant="outline" asChild size="sm">
                      <a href={url} download={fileName}>
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center space-x-2">
            <Button variant="outline" asChild size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Open in New Tab</span>
                <span className="sm:hidden">Open</span>
              </a>
            </Button>
            <Button variant="outline" asChild size="sm">
              <a href={url} download={fileName}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </a>
            </Button>
          </div>
        </div>
      );
    }

    // Text and Code Files
    if (isTextFile() || actualFileType.includes('json') || actualFileType.includes('xml')) {
      return (
        <div className="bg-muted/30 p-2 sm:p-4 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Loading content...
            </div>
          ) : previewError ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="mb-4">{previewError}</p>
              <Button variant="outline" asChild size="sm">
                <a href={url} download={fileName}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          ) : content ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {getLanguageFromFileName()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {content.split('\n').length} lines • {content.length} characters
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono leading-relaxed text-foreground max-h-64 sm:max-h-96 overflow-y-auto bg-background/50 p-2 sm:p-3 rounded border">
                {content}
              </pre>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Unable to load file content</p>
              <Button variant="outline" asChild size="sm" className="mt-2">
                <a href={url} download={fileName}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Executable files and other unsupported types
    return (
      <div className="text-center space-y-4 p-4 sm:p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto">
          {getFileIcon()}
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-2">
            {fileName.toLowerCase().endsWith('.exe') ? 'Executable File' : 'Preview not available'}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {fileName.toLowerCase().endsWith('.exe') 
              ? 'This is an executable file that cannot be previewed for security reasons.'
              : 'This file type cannot be previewed in the browser.'
            }
          </p>
          <Button variant="outline" asChild>
            <a href={url} download={fileName} className="inline-flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </a>
          </Button>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
        <CardContent className="p-2 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {getFileIcon()}
                <span className="text-sm font-medium text-foreground truncate">
                  {fileName}
                </span>
              </div>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 flex-shrink-0">
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {renderFileContent()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {getFileIcon()}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{fileName}</CardTitle>
              <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {actualFileType || 'Unknown'}
                </Badge>
                {fileSize && (
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(fileSize)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm" asChild>
              <a href={url} download={fileName}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderFileContent()}
      </CardContent>
    </Card>
  );
};
