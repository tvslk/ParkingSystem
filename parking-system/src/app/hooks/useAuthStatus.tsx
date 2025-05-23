"use client";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthStatus() {
  const { user, isLoading, isAdmin, adminChecked } = useAuth();
  const router = useRouter();
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login");
    }
  }, [isLoading, user]);

  return { user, isLoading, isAdmin, adminChecked };
}