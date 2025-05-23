import '../globals.css';
import AuthHeader from '@/components/AuthHeader';

export default async function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
