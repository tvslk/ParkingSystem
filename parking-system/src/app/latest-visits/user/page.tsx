"use client";

import { useEffect, useState } from "react";
import ListWindow from "../../components/ListWindow";
import Sidebar from "../../components/Sidebar/Sidebar";
import useSWR from "swr";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import LoadingOverlay from "../../components/LoadingOverlay";

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
  const rawName =
    visit.user?.name ||
    visit.user?.nickname ||
    visit.user?.email ||
    "Unknown";
  let sanitizedName = rawName.includes("@")
    ? rawName.split("@")[0]
    : rawName;
  sanitizedName =
    sanitizedName.length > 18
      ? sanitizedName.slice(0, 18) + "…"
      : sanitizedName;

  return (
    <>
      <span className="font-semibold">{sanitizedName}</span>
      {" — "}
      {formatCustomDateTime(visit.start_date)}
      {visit.end_date && (
        <> &rarr; {formatCustomDateTime(visit.end_date)}</>
      )}
    </>
  );
};

export default function UserVisits() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  
  const { data: userVisitsData, error } = useSWR(
    user ? "/api/latest-visits/user" : null, 
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

  if (error) return <div>Error loading user visits.</div>;

  const headerTitle = "Latest user visits";
  const listWindowTitle = "List of all user visits";

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
              items={userVisitsData || []}
              formatItem={formatUserVisit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}