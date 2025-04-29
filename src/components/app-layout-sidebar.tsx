'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Code2,
  History,
  User,
} from 'lucide-react';
import { useAuth, useLogout } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConnectYouTubeButton } from '@/components/ConnectYouTubeButton';
import { YouTubeIcon } from '@/components/icons/YouTube';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

/**
 * @description Sidebar component specifically for the main application layout.
 * Integrates authentication context and provides navigation for chat history and YouTube connection.
 */
export function AppLayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isYouTubeConnected } = useAuth();
  const { logout } = useLogout();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/chat">
                <Code2 className="!size-5 text-primary" />
                <span className="text-base font-semibold">relation.dev</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        {/* Main Navigation */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/chat/history">
                <History className="size-4" />
                Recent Conversations
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isYouTubeConnected ? (
              <SidebarMenuButton asChild>
                <Link href="/youtube">
                  <YouTubeIcon className="size-4 text-muted-foreground" />
                  YouTube
                </Link>
              </SidebarMenuButton>
            ) : (
              // Render ConnectYouTubeButton directly, adjusting styling if needed
              // Note: SidebarMenuButton expects a button/link structure,
              // so direct rendering might need wrapper or style adjustments.
              // For simplicity, placing it here. Consider wrapping if layout breaks.
              <div className="px-3 py-1.5"> {/* Added padding for alignment */}
                <ConnectYouTubeButton variant="full" />
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Spacer to push user section to bottom */}
        <div className="mt-auto" />

      </SidebarContent>
      <SidebarFooter>
        {/* User Account Section */}
        <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton className="w-full">
              <User className="size-4" />
              Me
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>
                Manage your account settings. Click disconnect to log out.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {user?.email && (
                 <div className="text-sm text-muted-foreground">Logged in as: {user.email}</div>
              )}
            </div>
            <Button variant="destructive" onClick={logout} className="w-full">
              Disconnect
            </Button>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
