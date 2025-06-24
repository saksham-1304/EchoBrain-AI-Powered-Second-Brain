
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, FileText, Link, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const CompactUploadView: React.FC = () => {
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 dark:border-slate-700/30 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="h-32 w-full rounded-lg bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-blue-500/20 rounded-full"
                >
                  <Brain className="h-8 w-8 text-blue-600" />
                </motion.div>
                <div className="text-lg font-medium text-blue-700 dark:text-blue-300">
                  AI Knowledge Hub
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-foreground">AI Knowledge Assistant</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your intelligent brain is ready to absorb knowledge. Use the Create Content button above to feed it new information and watch AI extract meaningful insights.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-4">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Smart Notes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Link className="h-3 w-3" />
                  <span>Web Articles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Upload className="h-3 w-3" />
                  <span>File Upload</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Insights</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
