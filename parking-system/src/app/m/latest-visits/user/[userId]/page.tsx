"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useAuthStatus } from "../../../../hooks/useAuthStatus";
import { useDelayedReady } from "../../../../hooks/useDelayedReady";
import LoadingOverlay from "../../../../components/LoadingOverlay";
import UnauthorizedPage from "../../../../unauthorized/page";

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

export default function MobileUserVisitDetailsPage() {
  const { userId } = useParams();
  const { user: authUser, isLoading, isAdmin, adminChecked } = useAuthStatus();
  
  const { data: apiResponse, error } = useSWR(
    authUser ? `/api/latest-visits/user/${userId}` : null, 
    fetcher
  );

  const isReady = useDelayedReady({
    delay: 1000, 
    dependencies: [isLoading, authUser, adminChecked], 
    condition: !isLoading && !!authUser && adminChecked
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (!authUser) {
    return <UnauthorizedPage />;
  }

  // Only allow access if user is viewing their own visits or is an admin
  if (!isAdmin && authUser.sub !== userId) {
    return <UnauthorizedPage />;
  }

  if (error) {
    return <div className="p-4 text-center">Error loading user visits.</div>;
  }
  
  if (!apiResponse) {
    return <LoadingOverlay />; 
  }

  const fetchedUser = apiResponse.user;
  const userVisits = apiResponse.visits || [];

  const userName = fetchedUser?.name || fetchedUser?.nickname || "User";
  
  const headerTitle = `${userName}'s visits`;
  const listTitle = "Visit history";

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
              {userVisits.length > 0 ? (
                userVisits.map((item: any, index: number) => (
                  <li
                    key={`${item.id}-${index}`}
                    className={`py-2 border-b text-gray-500 ${
                      index === 0 ? "border-t" : ""
                    }`}
                  >
                    {formatCustomDateTime(item.start_date)}
                    {item.end_date ? (
                      <> &rarr; {formatCustomDateTime(item.end_date)}</>
                    ) : (
                      <> &mdash; Active Visit</>
                    )}
                  </li>
                ))
              ) : (
                <li className="py-2 text-gray-500">No visits recorded for this user.</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
