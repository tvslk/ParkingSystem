"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import InterfaceButton from "../../components/Buttons/InterfaceButtons";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import LoadingOverlay from "../../components/LoadingOverlay";
import UnauthorizedPage from "../../unauthorized/page";

// Same fetcher from the desktop version
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function MobileUsersPage() {
  const router = useRouter();
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
            <ul className="overflow-y-auto max-h-[55vh]">
              {(usersData?.length ?? 0) > 0 ? (
                usersData.map((u: any, index: number) => (
                  <li
                    key={u?.sub || u?.id}
                    className={`py-2 border-b text-gray-500 ${index === 0 ? "border-t" : ""} active:bg-gray-200`}
                    onClick={() => router.push(`/m/latest-visits/user/${u.user_id || u.id || u.sub}`)}
                  >
                    <div className="cursor-pointer flex items-center justify-between">
                      <span>{u.name || "Unknown"} ({u.email || "No Email"})</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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