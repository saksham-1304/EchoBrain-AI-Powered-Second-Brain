
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ContentItem } from '@/types/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save, FileText, Link, Eye, Zap } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { CustomTagInput } from '@/components/CustomTagInput';

interface ContentEditFormProps {
  content?: ContentItem;
  onSave: (content: ContentItem) => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  summary: string;
  content: string;
  type: 'note' | 'pdf' | 'url' | 'article';
  category: string;
  sourceUrl: string;
}

export const ContentEditForm: React.FC<ContentEditFormProps> = ({ 
  content, 
  onSave, 
  onCancel 
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      title: content?.title || '',
      summary: content?.summary || '',
      content: content?.content || '',
      type: content?.type || 'note',
      category: content?.category || '',
      sourceUrl: content?.sourceUrl || '',
    }
  });
  
  const [tags, setTags] = useState<string[]>(content?.tags || []);
  const { showSuccess, showError } = useNotifications();
  
  const watchedType = watch('type');

  const onSubmit = (data: FormData) => {
    try {
      const updatedContent: ContentItem = {
        id: content?.id || crypto.randomUUID(),
        title: data.title,
        summary: data.summary,
        content: data.content,
        type: data.type,
        category: data.category,
        sourceUrl: data.sourceUrl,
        tags,
        entities: content?.entities || {
          people: [],
          topics: [],
          dates: [],
          locations: []
        },
        insights: content?.insights || [],
        connections: content?.connections || [],
        createdAt: content?.createdAt || new Date(),
        updatedAt: new Date(),
        isShared: content?.isShared || false,
      };
      
      onSave(updatedContent);
      showSuccess(content ? 'Content updated successfully' : 'Content created successfully');
    } catch (error) {
      showError('Failed to save content');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="h-4 w-4" />;
      case 'url': case 'article': return <Link className="h-4 w-4" />;
      case 'pdf': return <Eye className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/20 dark:border-slate-700/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getTypeIcon(watchedType)}
              <span>{content ? 'Edit Content' : 'Create New Content'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    className="mt-1"
                    placeholder="Enter content title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Content Type</Label>
                  <select
                    id="type"
                    {...register('type')}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="note">Note</option>
                    <option value="article">Article</option>
                    <option value="url">URL</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    {...register('category')}
                    className="mt-1"
                    placeholder="e.g., Research, Personal, Work"
                  />
                </div>

                {(watchedType === 'url' || watchedType === 'article') && (
                  <div>
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input
                      id="sourceUrl"
                      {...register('sourceUrl')}
                      className="mt-1"
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    {...register('summary')}
                    className="mt-1 h-32"
                    placeholder="Brief summary of the content"
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="mt-1">
                    <CustomTagInput
                      tags={tags}
                      onTagsChange={setTags}
                      placeholder="Add tags (Ctrl+K for search)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register('content', { required: 'Content is required' })}
                className="mt-1 h-64"
                placeholder="Enter your content here..."
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{content ? 'Update' : 'Create'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
