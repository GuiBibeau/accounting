"use client";

import React from "react";
import Link from "next/link";
import { useUser, useLogout } from "@/contexts/AuthContext";

export default function AuthHeader() {
  const { user, loading } = useUser();
  const { logout, logoutError } = useLogout();

  const handleLogout = async () => {
    await logout();
    // Optional: Add redirect logic here if needed, though context handles user state
  };

  if (loading) {
    return <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Loading user...</div>;
  }

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>My App</span>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '10px' }}>{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
            {logoutError && <p style={{ color: "red", marginLeft: '10px' }}>Logout Error: {logoutError.message}</p>}
          </>
        ) : (
          <>
            <Link href="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}
