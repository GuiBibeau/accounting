import * as React from 'react';
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type SiteHeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

/**
 * @description Renders the site header with a dynamic title and optional action buttons.
 * Includes a trigger to toggle the sidebar visibility.
 * @param {SiteHeaderProps} props - Component props.
 * @param {string} props.title - The title to display in the header.
 * @param {React.ReactNode} [props.actions] - Optional React node(s) for action buttons/elements on the right side.
 */
export function SiteHeader({ title, actions }: SiteHeaderProps) {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2 h-4" // Simplified class, assuming h-4 is sufficient
      />
      <h1 className="text-base font-medium">{title}</h1>
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
