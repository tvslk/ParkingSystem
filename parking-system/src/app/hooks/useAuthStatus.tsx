"use client";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { isUserAdmin } from "../../actions/isUserAdmin";

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
      isUserAdmin()
        .then((adminStatus) => {
          setIsAdmin(adminStatus);
          setAdminChecked(true);
        })
        .catch((err) => {
          console.error("Error checking admin status:", err);
          setIsAdmin(false);
          setAdminChecked(true);
        });
    }
  }, [isLoading, user]);

  return { user, isLoading, isAdmin, adminChecked };
}