"use client";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export function useAuthStatus() {
  const { user, isLoading, isAdmin, adminChecked } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
    }
  }, [isLoading, user]);

  return { user, isLoading, isAdmin, adminChecked };
}