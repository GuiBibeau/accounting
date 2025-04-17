import { SideNav } from './SideNav';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SideNav />
      {children}
    </div>
  );
}
