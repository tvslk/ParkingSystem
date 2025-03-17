"use client";

import ListWindow from "../components/ListWindow";
import Sidebar from "../components/Sidebar";
import useSWR from "swr";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useDecodedToken } from "../hooks/DecodedToken";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const formatSpotId = (spotId: number | string) =>
  "PS" + spotId.toString().padStart(3, "0");

const formatVisit = (visit: any) =>
  `${new Date(visit.created_at).toLocaleString()} - ${formatSpotId(visit.spot_id)}`;

export default function LatestVisits() {
    const { user, isLoading } = useUser();
  
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (!user) {
      window.location.href = '/api/auth/login';
      return null; 
    }
  
  const decoded = useDecodedToken();
  const isAdmin = decoded?.admin || false;

  const headerTitle = isAdmin
    ? "Latest parking spot updates"
    : `${decoded?.fullName || "User"}`;
  const listWindowTitle = isAdmin ? "List of all spot logs" : "Latest visits";

  const { data: visitsData, error } = useSWR("/api/latest-visits", fetcher);

  if (error) return <div>Error loading visits.</div>;
  if (!visitsData) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      {/* Main Content: Using a flex column layout */}
      <div className="flex-1 p-8 flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>

        {/* Content: Center the ListWindow if there’s only a few logs */}
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