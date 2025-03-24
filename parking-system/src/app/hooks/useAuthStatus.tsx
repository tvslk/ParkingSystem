"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { isUserAdmin } from "../../actions/isUserAdmin";

export function useAuthStatus() {
  const { user, isLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  // Use useCallback to memoize the admin check function
  const checkAdminStatus = useCallback(async () => {
    if (user) {
      const adminStatus = await isUserAdmin();
      setIsAdmin(adminStatus);
      setAdminChecked(true);
    } else {
      setIsAdmin(false);
      setAdminChecked(true);
    }
  }, [user]);

  // Redirect to login if no user.
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
    }
  }, [isLoading, user]);

  // Check admin status.
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { user, isLoading, isAdmin, adminChecked };
}