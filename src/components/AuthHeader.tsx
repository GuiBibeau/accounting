"use client";

import React from "react";
import { useUser, useLogout } from "@/contexts/AuthContext";
import {
  Navbar,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/ui/navbar";
// Removed unused Button import
import { AvatarButton } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
} from "@/components/ui/dropdown";
// Removed unused Link import

export default function AuthHeader() {
  const { user, loading } = useUser();
  const { logout, logoutError } = useLogout(); // Keep logoutError for potential future use

  const handleLogout = async () => {
    await logout();
    // Optional: Add redirect logic here if needed, though context handles user state
    if (logoutError) {
      console.error("Logout Error:", logoutError.message); // Log error for now
    }
  };

  // Simple loading state
  if (loading) {
    return (
      <Navbar>
        <NavbarSection>
          <NavbarItem>
            <NavbarLabel>Loading...</NavbarLabel>
          </NavbarItem>
        </NavbarSection>
      </Navbar>
    );
  }

  // Extract initials for Avatar
  const getInitials = (email?: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <Navbar>
      <NavbarItem href="/">
        <NavbarLabel>AI Accountant</NavbarLabel> {/* Updated App Name */}
      </NavbarItem>
      <NavbarSpacer />
      <NavbarSection>
        {user ? (
          <Dropdown>
            <DropdownButton as={AvatarButton} initials={getInitials(user.email)} className="size-8" />
            <DropdownMenu>
              <DropdownItem disabled>
                <DropdownLabel>{user.email}</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout}>
                 Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
         ) : (
           <>
             <NavbarItem href="/login">Login</NavbarItem>
             <NavbarItem href="/signup">Sign Up</NavbarItem>
           </>
         )}
      </NavbarSection>
    </Navbar>
  );
}
