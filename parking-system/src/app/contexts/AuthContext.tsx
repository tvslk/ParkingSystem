"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAdmin: boolean;
  adminChecked: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  adminChecked: false,
});

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminChecked, setAdminChecked] = useState<boolean>(false);
  
  useEffect(() => {
    if (isLoading || !user) {
      return;
    }
    
    // Only check admin status once per session
    if (!adminChecked) {
      fetch('/api/auth/check-admin')
        .then(response => response.json())
        .then(data => {
          setIsAdmin(data.isAdmin);
          setAdminChecked(true);
          console.log(`User ${user.email} admin status: ${data.isAdmin}`);
        })
        .catch(err => {
          console.error("Error checking admin status:", err);
          setIsAdmin(false);
          setAdminChecked(true);
        });
    }
  }, [user, isLoading, adminChecked]);
  
  // Value that will be provided to consumers of this context
  const contextValue: AuthContextType = {
    user,
    isLoading: isLoading || (!!user && !adminChecked), // Still loading if waiting for admin check
    isAdmin,
    adminChecked,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook that lets components consume the auth context
export function useAuth() {
  return useContext(AuthContext);
}