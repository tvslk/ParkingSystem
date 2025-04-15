"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import useSWR from "swr";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Auth0UserResponse {
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function Dashboard() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  // Example: fetching user data
  const [userData, setUserData] = useState<Auth0UserResponse | null>(null);
  useEffect(() => {
    if (!user?.sub) return;
    fetch(`/api/users/${user.sub}`)
      .then((res) => res.json())
      .then(setUserData)
      .catch((err) => console.error("Error fetching user data:", err));
  }, [user]);

  const isReady = useDelayedReady({
    delay: 1000, 
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }
  if (!user) return <div>Please log in.</div>;

  const fullName = user?.name || "User";
  const headerTitle = isAdmin
    ? "Admin Profile"
    : `${fullName}'s Profile`;

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full mx-auto">
            {userData ? (
              <div className="bg-zinc-100 rounded-2xl shadow-md p-6 w-full max-w-md mx-auto">
                <div className="flex flex-col items-center space-y-6">
                    {userData.picture && (
                        <img
                            src={userData.picture}
                            alt="Profile"
                            className="w-36 h-36 rounded-full object-cover border-4"
                        />
                    )}
                    <div className="w-full">
                        <label className="block text-xs font-normal px-2 text-zinc-500">Name</label>
                        <input
                            type="text"
                            readOnly
                            className="mt-2 block w-full border-gray-300 text-zinc-500 rounded-md shadow-sm text-lg py-2 px-3"
                            value={userData.name || "N/A"}
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-normal px-2 text-zinc-500">Email</label>
                        <input
                            type="text"
                            readOnly
                            className="mt-2 block w-full border-gray-300 text-zinc-500 rounded-md shadow-sm text-lg py-2 px-3"
                            value={userData.email || "N/A"}
                        />
                    </div>
                </div>
                </div>
            ) : (
              <LoadingOverlay />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}