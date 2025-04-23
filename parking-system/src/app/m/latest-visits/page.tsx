"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import LoadingOverlay from "../../components/LoadingOverlay";
import UnauthorizedPage from "../../unauthorized/page";
import InterfaceButton from "../../components/Buttons/InterfaceButtons";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const formatSpotId = (spotId: number | string) =>
  "PS" + spotId.toString().padStart(3, "0");

const formatCustomDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function MobileLatestVisitsPage() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  const { data: visitsData, error } = useSWR(user ? "/api/latest-visits" : null, fetcher);

  const isReady = useDelayedReady({
    delay: 1000,
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked,
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div className="p-4 text-center">Error loading visits.</div>;
  }

    if (!user) {
    return <UnauthorizedPage />;
  }

  const headerTitle = "Latest parking spot updates";
  const listTitle = "All spot logs";

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
              {(visitsData?.length ?? 0) > 0 ? (
                visitsData.map((item: any, index: number) => (
                  <li
                    key={`${item.id || item.created_at}-${index}`}
                    className={`py-2 border-b text-gray-500 ${index === 0 ? "border-t" : ""}`}
                  >
                    {formatCustomDateTime(item.created_at)} - {formatSpotId(item.spot_id)} -{" "}
                    {item.availability === 1 ? "Departed" : "Arrived"}
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