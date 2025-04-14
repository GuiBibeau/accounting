import { AuthProvider } from "@/contexts/AuthContext";
import "../globals.css";
import AuthHeader from "@/components/AuthHeader";

export default async function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthProvider>
      <AuthHeader />
      {children}
    </AuthProvider>
  );
}
