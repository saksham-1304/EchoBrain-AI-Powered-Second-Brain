
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomTagInput } from '@/components/CustomTagInput';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadTabProps {
  selectedFiles: File[];
  onFileSelection: (files: FileList | null) => void;
  onFileUpload: () => void;
  onRemoveFile: (index: number) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  isLoading: boolean;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  selectedFiles,
  onFileSelection,
  onFileUpload,
  onRemoveFile,
  tags,
  setTags,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-white/30 dark:border-slate-600/30 rounded-lg p-8 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drag & drop files here</p>
        <p className="text-muted-foreground mb-4">or click to browse</p>
        <input
          type="file"
          multiple
          onChange={(e) => onFileSelection(e.target.files)}
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
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="h-6 w-6 p-0"
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
            onClick={onFileUpload}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          >
            {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
};
