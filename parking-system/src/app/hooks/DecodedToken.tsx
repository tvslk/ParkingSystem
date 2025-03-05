"use client";

import { useState, useEffect } from "react";

export const useDecodedToken = () => {
  const [decoded, setDecoded] = useState<{ fullName?: string; admin?: boolean } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedToken = JSON.parse(jsonPayload);
          setDecoded(decodedToken);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    }
  }, []);

  return decoded;
};