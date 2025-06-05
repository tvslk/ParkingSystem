"use client";

import { useEffect } from "react";
import ListWindow from "../../../components/ListWindow";
import Sidebar from "../../../components/Sidebar/Sidebar";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useAuthStatus } from "../../../hooks/useAuthStatus";
import { useDelayedReady } from "../../../hooks/useDelayedReady";
import LoadingOverlay from "../../../components/LoadingOverlay";

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

const formatUserVisit = (visit: any) => {
  return (
    <>
      {formatCustomDateTime(visit.start_date)}
      {visit.end_date ? (
        <> &rarr; {formatCustomDateTime(visit.end_date)}</>
      ) : (
        <> &mdash; Active Visit</>
      )}
    </>
  );
};

export default function UserVisitDetails() {
  const { userId } = useParams();
  const { user: authUser, isLoading, isAdmin, adminChecked } = useAuthStatus(); // Renamed to authUser to avoid conflict
  
  // myVisitsData will now be an object: { user: UserObject, visits: Visit[] }
  const { data: apiResponse, error } = useSWR(
    authUser ? `/api/latest-visits/user/${userId}` : null, 
    fetcher
  );

  const isReady = useDelayedReady({
    delay: 1000, 
    dependencies: [isLoading, authUser, adminChecked, apiResponse !== undefined], 
    condition: !isLoading && !!authUser && adminChecked && apiResponse !== undefined
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (error) return <div>Error loading user visits. Details: {error.message}</div>;
  if (!apiResponse) return <LoadingOverlay />; 

  const fetchedUser = apiResponse.user;
  const userVisits = apiResponse.visits;

  const userName = fetchedUser?.name || fetchedUser?.nickname || "User";
  
  const headerTitle = `${userName}'s visits history`;
  const listWindowTitle = "List of visits";

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full mx-auto">
            <ListWindow
              title={listWindowTitle}
              items={userVisits || []} 
              formatItem={formatUserVisit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}