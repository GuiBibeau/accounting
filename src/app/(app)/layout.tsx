import * as React from 'react';
import { AppLayoutSidebar } from '@/components/app-layout-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * @description Main layout for the application section, featuring a sidebar and header.
 * Uses SidebarProvider to manage sidebar state and context.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child elements to be rendered within the main content area.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppLayoutSidebar variant="inset" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
