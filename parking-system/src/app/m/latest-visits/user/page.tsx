"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "../../../hooks/useAuthStatus";
import { useDelayedReady } from "../../../hooks/useDelayedReady";
import LoadingOverlay from "../../../components/LoadingOverlay";
import UnauthorizedPage from "../../../unauthorized/page";
import InterfaceButton from "../../../components/Buttons/InterfaceButtons";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

function formatCustomDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}.${String(
    date.getMonth() + 1
  ).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export default function MobileUserVisitsPage() {
  const router = useRouter();
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  const { data: userVisitsData, error } = useSWR(
    user && isAdmin ? "/api/latest-visits/user" : null, 
    fetcher
  );

  const isReady = useDelayedReady({
    delay: 1000, 
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return <UnauthorizedPage />;
  }

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  if (error) {
    return <div className="p-4 text-center">Error loading user visits.</div>;
  }

  const headerTitle = "Latest user visits";
  const listTitle = "All user visits";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-500">{headerTitle}</h1>
      </header>

      <main className="flex-1 flex items-start justify-center p-2">
        <div className="w-full mx-2">
          <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-500">{listTitle}</h2>
            </div>
            <ul className="overflow-y-auto max-h-[55vh]">
              {(userVisitsData?.length ?? 0) > 0 ? (
                userVisitsData.map((item: any, index: number) => {
                  const rawName =
                    item.user?.name ||
                    item.user?.nickname ||
                    item.user?.email ||
                    "Unknown";
                  let sanitizedName = rawName.includes("@")
                    ? rawName.split("@")[0]
                    : rawName;
                  sanitizedName =
                    sanitizedName.length > 18
                      ? sanitizedName.slice(0, 18) + "…"
                      : sanitizedName;
                  
                  // The user ID for navigation
                  const userIdForNav = item.user?.user_id || item.user_id || item.user?.sub;

                  return (
                    <li
                      key={`${item.id}-${index}`}
                      className={`py-2 border-b text-gray-500 ${
                        index === 0 ? "border-t" : ""
                      } ${userIdForNav ? "active:bg-gray-200" : ""}`}
                      onClick={() => {
                        if (userIdForNav) {
                          router.push(`/m/latest-visits/user/${userIdForNav}`);
                        }
                      }}
                    >
                      <span className="font-semibold">{sanitizedName}</span>
                      {" — "}
                      {formatCustomDateTime(item.start_date)}
                      {item.end_date && (
                        <> &rarr; {formatCustomDateTime(item.end_date)}</>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="py-2 text-gray-500">No user visits available.</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
