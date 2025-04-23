
// filepath: /Users/tvslk/Desktop/GL/SpotMonitoring/backend/parking-system/src/app/m/users/page.tsx
"use client";

import { useEffect } from "react";
import useSWR from "swr";
import InterfaceButton from "../../components/Buttons/InterfaceButtons";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import LoadingOverlay from "../../components/LoadingOverlay";
import UnauthorizedPage from "../../unauthorized/page";

// Same fetcher from the desktop version
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function MobileUsersPage() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  const { data: usersData, error } = useSWR("/api/users", fetcher);

  const isReady = useDelayedReady({
    delay: 1000,
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return <UnauthorizedPage/>;
  }

  if (error) {
    return <div>Error loading users.</div>;
  }

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  const headerTitle = "Users";
  const listWindowTitle = "List of all users";

  const formatUser = (u: any) =>
    `${u.name || "Unknown"} (${u.email || "No Email"})`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-500">{headerTitle}</h1>
      </header>

      <main className="flex-1 flex items-start justify-center p-2">
        <div className="w-full mx-2">
          {/* Use the same layout style */}
          <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-500">{listWindowTitle}</h2>
            </div>
            <ul>
              {(usersData?.length ?? 0) > 0 ? (
                usersData.slice(0, 4).map((u: any, index: number) => (
                  <li
                    key={u?.sub || u?.id}
                    className={`py-2 border-b text-gray-500 ${index === 0 ? "border-t" : ""}`}
                  >
                    {formatUser(u)}
                  </li>
                ))
              ) : (
                <li className="py-2 text-gray-500">No data available.</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}