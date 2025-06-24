
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentItem } from '@/types/content';
import { Brain, Upload, FileText, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompactUploadView } from './upload/CompactUploadView';
import { NoteCreationTab } from './upload/NoteCreationTab';
import { UrlSavingTab } from './upload/UrlSavingTab';
import { FileUploadTab } from './upload/FileUploadTab';
import { useContentCreation } from './upload/useContentCreation';

interface UploadZoneProps {
  onContentAdded: (content: ContentItem) => void;
  compact?: boolean;
  showCreateButton?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onContentAdded, 
  compact = false, 
  showCreateButton = false 
}) => {
  const [activeTab, setActiveTab] = useState('note');
  
  const {
    isLoading,
    title,
    setTitle,
    noteContent,
    setNoteContent,
    url,
    setUrl,
    tags,
    setTags,
    selectedFiles,
    handleNoteSubmit,
    handleUrlSubmit,
    handleFileSelection,
    handleFileUpload,
    removeSelectedFile
  } = useContentCreation(onContentAdded);

  if (compact) {
    return <CompactUploadView />;
  }

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Feed Your Brain
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Add knowledge and let AI extract meaningful insights automatically
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="note" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Create Note</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center space-x-2">
                <Link className="h-4 w-4" />
                <span>Save URL</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="note">
              <NoteCreationTab
                title={title}
                setTitle={setTitle}
                noteContent={noteContent}
                setNoteContent={setNoteContent}
                tags={tags}
                setTags={setTags}
                onSubmit={handleNoteSubmit}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="url">
              <UrlSavingTab
                title={title}
                setTitle={setTitle}
                url={url}
                setUrl={setUrl}
                tags={tags}
                setTags={setTags}
                onSubmit={handleUrlSubmit}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="upload">
              <FileUploadTab
                selectedFiles={selectedFiles}
                onFileSelection={handleFileSelection}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeSelectedFile}
                tags={tags}
                setTags={setTags}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
