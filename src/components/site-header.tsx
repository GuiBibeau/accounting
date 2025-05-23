import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

type SiteHeaderProps = {
  title: string;
  lastSyncedAt?: string | null;
  tabsContent?: React.ReactNode; // Added new prop for tabs
};

/**
 * @description Renders the site header with a dynamic title.
 * Includes a trigger to toggle the sidebar visibility.
 * @param {SiteHeaderProps} props - Component props.
 * @param {string} props.title - The title to display in the header.
 */
export function SiteHeader({
  title,
  lastSyncedAt,
  tabsContent,
}: SiteHeaderProps) {
  return (
    <header className="flex flex-col shrink-0 border-b px-4 lg:px-6 py-2">
      {/* Top row for title, sync time, and actions */}
      <div className="flex h-[calc(var(--header-height)_-_0.5rem)] w-full items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium">{title}</h1>
          {lastSyncedAt && (
            <span className="text-xs text-muted-foreground">
              (Synced: {lastSyncedAt})
            </span>
          )}
        </div>
        <div className="mt-2 w-full pl-[calc(4.25rem+1px)]">{tabsContent}</div>
      </div>

      {/* Bottom row for tabs */}
    </header>
  );
}
