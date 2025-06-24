
import React, { useState } from 'react';
import { 
  Brain, 
  FileText, 
  Tags, 
  Search, 
  Settings, 
  Share,
  Grid,
  BookOpen,
  X,
  User,
  BarChart3,
  Copy,
  Check
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppSidebarProps {
  contentCount: number;
  isShared: boolean;
  onToggleShare: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  contentCount,
  isShared,
  onToggleShare,
}) => {
  const { user } = useAuth();
  const { setOpenMobile, setOpen } = useSidebar();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCloseSidebar = () => {
    setOpenMobile(false);
    setOpen(false);
  };

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

  const accountItems = [
    {
      title: 'Profile',
      icon: User,
      onClick: () => {
        navigate('/profile');
        handleCloseSidebar();
      },
      description: 'Manage your account',
    },
    {
      title: 'Dashboard',
      icon: BarChart3,
      onClick: () => {
        navigate('/dashboard');
        handleCloseSidebar();
      },
      description: 'View analytics',
    },
  ];

  const actionItems = [
    {
      title: isShared ? 'Make Private' : 'Share Brain',
      icon: Share,
      onClick: () => {
        onToggleShare();
        handleCloseSidebar();
      },
      description: isShared ? 'Currently public' : 'Currently private',
    },
  ];

  return (
    <Sidebar className="animate-slide-in-left">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold truncate">
                {user?.name}'s Brain
              </h2>
              <p className="text-xs text-muted-foreground">
                {contentCount} items
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseSidebar}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
            {isShared && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">
                  Share this link:
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="text-xs bg-white dark:bg-slate-800 border-green-300 dark:border-green-700 h-8"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    {linkCopied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Status:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isShared ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{isShared ? 'Public' : 'Private'}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
