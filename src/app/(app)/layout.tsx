import { SideNav } from './chat/SideNav';

export default function AppLayout({
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
