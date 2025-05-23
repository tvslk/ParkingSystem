"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

// Helper functions - moved to module level
function getStoredPicture() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_profile_pic');
}

function storePicture(url: string | null) {
  if (typeof window === 'undefined' || !url) return;
  localStorage.setItem('user_profile_pic', url);
}

// Extended context type with profilePicture
interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAdmin: boolean;
  adminChecked: boolean;
  profilePicture: string | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  adminChecked: false,
  profilePicture: null,
});

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminChecked, setAdminChecked] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(getStoredPicture());
  
  // First: check admin status
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
        })
        .catch(err => {
          console.error("Failed to check admin status", err);
          setAdminChecked(true); // Mark as checked anyway to avoid infinite retries
        });
    }
  }, [user, isLoading, adminChecked]);

  // Handle profile picture persistence
  useEffect(() => {
    if (isLoading || !user?.sub) {
      return;
    }
    
    // Always check stored pic first
    const storedPic = getStoredPicture();
    if (storedPic) {
      console.log("Using stored picture from localStorage:", storedPic);
      setProfilePicture(storedPic);
    }
    
    // Then try to get from DB (our source of truth)
    console.log("Fetching profile picture from API");
    fetch('/api/profile')
      .then(res => {
        if (!res.ok) throw new Error(`API responded with status ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("API returned profile data:", data);
        
        if (data.picture) {
          // 1. If we have a picture in DB, use that
          console.log("Setting picture from DB:", data.picture);
          setProfilePicture(data.picture);
          storePicture(data.picture);
        } else if (user.picture) {
          // 2. No DB pic but Auth0 has one - use it
          console.log("Using Auth0 picture:", user.picture);
          
          // Check if we need to proxy the image
          let picToUse = user.picture;
          
          // For Gravatar/Auth0 URLs, use our proxy to avoid CORS issues
          if (user.picture.includes('gravatar.com') || 
              user.picture.includes('cdn.auth0.com')) {
            picToUse = `/api/proxy-image?url=${encodeURIComponent(user.picture)}`;
            console.log("Using proxied URL instead:", picToUse);
          }
          
          setProfilePicture(picToUse);
          storePicture(picToUse);
          
          // Save to DB for future use
          console.log("Saving picture to DB:", picToUse);
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pictureUrl: picToUse })
          })
          .then(response => {
            if (!response.ok) throw new Error(`DB save failed with status ${response.status}`);
            return response.json();
          })
          .then(data => console.log("Picture saved to DB:", data))
          .catch(err => console.error("DB save error:", err));
        }
      })
      .catch(err => {
        console.error("Profile API error:", err);
        // On API failure, use localStorage or Auth0 pic
        const fallbackPic = getStoredPicture() || user.picture;
        if (fallbackPic) {
          console.log("Using fallback picture:", fallbackPic);
          setProfilePicture(fallbackPic);
        }
      });
  }, [user?.sub, isLoading]); // Only re-run when user.sub changes

  // Provide the context value
  const value = {
    user,
    isLoading,
    isAdmin,
    adminChecked,
    profilePicture: profilePicture || user?.picture || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);