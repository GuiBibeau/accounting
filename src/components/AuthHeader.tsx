"use client";

import React from "react";
import Link from "next/link";
import { useUser, useLogout } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Shadcn Avatar (Removed AvatarImage)
import { Button, buttonVariants } from "@/components/ui/button"; // Shadcn Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Shadcn DropdownMenu

export default function AuthHeader() {
  const { user, loading } = useUser();
  const { logout, logoutError } = useLogout();

  const handleLogout = async () => {
    await logout();
    if (logoutError) {
      console.error("Logout Error:", logoutError.message);
    }
  };

  // Function to get initials from email
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    const parts = email.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 max-w-screen-2xl items-center">
        {/* App Name/Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* <Icons.logo className="h-6 w-6" /> Optional Logo */}
          <span className="font-bold">AI Accountant</span>
        </Link>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Loading State */}
          {loading && (
            <span className="text-sm text-muted-foreground">Loading...</span>
          )}

          {/* User Dropdown or Login/Signup Links */}
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {/* Optional: Add AvatarImage if user has profile picture URL */}
                    {/* <AvatarImage src={user.photoURL || undefined} alt={user.email || 'User'} /> */}
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add other items like Settings, Profile etc. if needed */}
                {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading && !user ? (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "default" })} // Or "ghost" or other variant
              >
                Sign Up
              </Link>
            </>
          ) : null /* Handles the case where loading is false but user state is indeterminate */}
        </div>
      </nav>
    </header>
  );
}
