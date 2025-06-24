
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomTagInput } from '@/components/CustomTagInput';
import { ContentItem } from '@/types/content';
import { FileText, Link, Upload, X } from 'lucide-react';

interface ContentCrudModalProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (content: ContentItem) => void;
}

export const ContentCrudModal: React.FC<ContentCrudModalProps> = ({
  content,
  open,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState('note');
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setNoteContent(content.content);
      setUrl(content.sourceUrl || '');
      setTags(content.tags);
      setActiveTab(content.type === 'url' ? 'url' : content.type === 'pdf' ? 'upload' : 'note');
    } else {
      // Reset form for new content
      setTitle('');
      setNoteContent('');
      setUrl('');
      setTags([]);
      setSelectedFiles([]);
      setActiveTab('note');
    }
  }, [content, open]);

  const createContentItem = (baseContent: Partial<ContentItem>): ContentItem => ({
    id: content?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: content?.createdAt || new Date(),
    updatedAt: new Date(),
    entities: {
      people: [],
      topics: [],
      dates: [],
      locations: []
    },
    connections: [],
    ...baseContent
  } as ContentItem);

  const handleNoteSubmit = async () => {
    if (!title.trim() || !noteContent.trim()) return;
    
    setIsLoading(true);
    try {
      const newContent = createContentItem({
        title: title.trim(),
        type: 'note',
        content: noteContent.trim(),
        summary: noteContent.trim().substring(0, 150) + (noteContent.length > 150 ? '...' : ''),
        tags: tags.length > 0 ? tags : ['note'],
        insights: [`${content ? 'Updated' : 'Created'}: ${new Date().toLocaleDateString()}`],
        category: 'notes'
      });
      
      onSave(newContent);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!title.trim() || !url.trim()) return;
    
    setIsLoading(true);
    try {
      const newContent = createContentItem({
        title: title.trim(),
        type: 'url',
        content: url.trim(),
        summary: `Web content from: ${url.trim()}`,
        tags: tags.length > 0 ? tags : ['web', 'article'],
        insights: [`Source: ${new URL(url).hostname}`],
        category: 'web',
        sourceUrl: url.trim()
      });
      
      onSave(newContent);
      onClose();
    } catch (error) {
      console.error('Error saving URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelection = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    try {
      for (const file of selectedFiles) {
        // Create blob URL for file preview
        const blobUrl = URL.createObjectURL(file);
        
        const newContent = createContentItem({
          title: file.name,
          type: 'pdf',
          content: `File uploaded: ${file.name}`,
          summary: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          tags: tags.length > 0 ? tags : ['uploaded'],
          insights: [`File size: ${(file.size / 1024).toFixed(1)} KB`],
          category: 'uploads',
          sourceUrl: blobUrl
        });
        
        onSave(newContent);
      }
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20 dark:border-slate-700/20">
        <DialogHeader>
          <DialogTitle>
            {content ? 'Edit Content' : 'Create New Content'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="note" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Create Note</span>
              <span className="sm:hidden">Note</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Save URL</span>
              <span className="sm:hidden">URL</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="note" className="space-y-4">
            <div>
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="bg-white/20 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
                className="bg-white/20 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
              />
            </div>
            <CustomTagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tags for this note..."
            />
            <Button
              onClick={handleNoteSubmit}
              disabled={isLoading || !title.trim() || !noteContent.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? 'Saving...' : content ? 'Update Note' : 'Create Note'}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="url-title">Title</Label>
              <Input
                id="url-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title for this URL..."
                className="bg-white/20 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
              />
            </div>
            <div>
              <Label htmlFor="url-input">URL</Label>
              <Input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-white/20 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/20"
              />
            </div>
            <CustomTagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tags for this URL..."
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={isLoading || !title.trim() || !url.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isLoading ? 'Saving...' : content ? 'Update URL' : 'Save URL'}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-white/30 dark:border-slate-600/30 rounded-lg p-4 sm:p-8 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-lg font-medium mb-2">Drag & drop files here</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => handleFileSelection(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild className="cursor-pointer">
                  <span>Choose Files</span>
                </Button>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="bg-white/20 dark:bg-slate-800/20 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/30 dark:bg-slate-700/30 rounded">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <CustomTagInput
                  tags={tags}
                  onTagsChange={setTags}
                  placeholder="Add tags for uploaded files..."
                />

                <Button
                  onClick={handleFileUpload}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
