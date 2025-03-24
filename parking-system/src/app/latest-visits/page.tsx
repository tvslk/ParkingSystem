"use client";

import { useEffect, useState } from "react";
import ListWindow from "../components/ListWindow";
import Sidebar from "../components/Sidebar/Sidebar";
import useSWR from "swr";
import { useAuthStatus } from "../hooks/useAuthStatus";
import LoadingOverlay from "../components/LoadingOverlay";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const formatSpotId = (spotId: number | string) =>
  "PS" + spotId.toString().padStart(3, "0");

const formatVisit = (visit: any) =>
  `${new Date(visit.created_at).toLocaleString()} - ${formatSpotId(visit.spot_id)}`;

export default function Dashboard() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  const fullName = user?.name || "User";

  const headerTitle = isAdmin
    ? "Latest parking spot updates"
    : `${fullName}'s Latest Visits`;
  const listWindowTitle = isAdmin ? "List of all spot logs" : "Latest visits";

  const { data: visitsData, error } = useSWR("/api/latest-visits", fetcher);

  if (isLoading || !user || !visitsData) return <LoadingOverlay />;
  if (error) return <div>Error loading visits.</div>;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto">
            <ListWindow
              title={listWindowTitle}
              items={visitsData}
              formatItem={formatVisit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}