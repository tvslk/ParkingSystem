"use client";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export function useAuthStatus() {
  const { user, isLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
      return;
    }

    if (user) {
      // Read roles from custom claim (adjust the namespace as needed)
      const roles = user['https://parkingsystem-gl.vercel.app/roles'] as string[];
      if (roles && roles.includes('admin')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAdminChecked(true);
    }
  }, [isLoading, user]);

  return { user, isLoading, isAdmin, adminChecked };
}
