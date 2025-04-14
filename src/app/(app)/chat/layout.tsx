import { SideNav } from './SideNav';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <SideNav />
      {children}
    </div>
  );
}
