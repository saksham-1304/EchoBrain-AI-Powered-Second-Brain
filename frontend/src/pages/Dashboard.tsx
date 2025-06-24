import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, FileText, Users, BarChart3, ArrowRight, Sparkles, Copy, Check, Share } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isShared, setIsShared] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const shareableLink = `${window.location.origin}/shared-brain/${user?.id || 'user'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleToggleShare = () => {
    setIsShared(!isShared);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's what's happening with your Second Brain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Content", value: "127", icon: FileText, color: "bg-blue-500" },
            { title: "AI Insights", value: "89", icon: Sparkles, color: "bg-purple-500" },
            { title: "Connections", value: "245", icon: BarChart3, color: "bg-green-500" },
            { title: "Shared Brains", value: "12", icon: Users, color: "bg-orange-500" }
          ].map((stat) => (
            <Card key={stat.title} className="hover:scale-105 transition-all duration-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-6 w-6 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/app')} 
                className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Main App
              </Button>
              <Button
                onClick={handleToggleShare}
                variant={isShared ? "default" : "outline"}
                className="w-full justify-start"
              >
                <Share className="h-4 w-4 mr-2" />
                {isShared ? 'Brain is Shared' : 'Share Brain'}
              </Button>
              {isShared && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Your brain is now public! Share this link:
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shareableLink}
                      readOnly
                      className="text-xs bg-white dark:bg-slate-800 border-green-300 dark:border-green-700"
                    />
                    <Button
                      onClick={handleCopyLink}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Upload New Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Added new article", time: "2 hours ago", type: "upload" },
                  { action: "Generated insights", time: "4 hours ago", type: "ai" },
                  { action: "Shared brain with team", time: "1 day ago", type: "share" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-slate-700/50">
                    <span className="text-sm">{activity.action}</span>
                    <Badge variant="secondary" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
