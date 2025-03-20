"use client";
import { useEffect } from "react";
import useSWR from "swr";
import { useUser } from "@auth0/nextjs-auth0/client";
import Sidebar from "../components/Sidebar";
import InterfaceButton from "../components/InterfaceButtons";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const formatSpotId = (id: number | string) =>
  "PS" + id.toString().padStart(3, "0");

function Dashboard() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
    }
  }, [isLoading, user]);

  const { data: countsData, error: countsError } = useSWR(
    "/api/spot-info?type=counts",
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: visitsData, error: visitsError } = useSWR(
    "/api/latest-visits",
    fetcher,
    { refreshInterval: 5000 }
  );

  if (isLoading || (!isLoading && !user)) {
    return <div>Loading...</div>;
  }

  const counts = countsData || { available: 0, occupied: 0 };

  if (countsError) {
    console.error("Error fetching counts:", countsError);
  }
  if (visitsError) {
    console.error("Error fetching visits:", visitsError);
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar remains fixed on the side */}
      <Sidebar />

      {/* Main Container: fills the remaining viewport height with no scrolling */}
      <div className="flex-1 p-8 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-500">Dashboard</h1>
        </header>

        {/* Grid Container */}
        <div className="flex-grow grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {/* Available/Occupied Spots Card */}
          <div className="m-2 bg-zinc-100 rounded-2xl shadow-md p-6 flex flex-col overflow-hidden">
            <div className="text-6xl font-bold text-emerald-700 mb-2">
              {counts.available}
            </div>
            <div className="text-gray-500 mb-4">
              <span className="font-bold">available</span> parking spots
            </div>
            <div className="text-6xl font-bold text-red-700 mt-4">
              {counts.occupied}
            </div>
            <div className="text-gray-500">
              <span className="font-bold">occupied</span> parking spots
            </div>
          </div>

          {/* Parking Lot Image Card */}
          <div className="m-2 bg-zinc-100 rounded-2xl shadow-md p-6 flex flex-col items-center overflow-hidden lg:col-span-2">
            <div className="flex-grow w-full flex items-center justify-center overflow-hidden">
              <div className="w-full overflow-hidden rounded-lg">
                <img
                  src="/map.png"
                  alt="Parking Lot"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
            <div className="w-full flex justify-center mt-4">
              <InterfaceButton label="Show parking lot" />
            </div>
          </div>

          {/* Latest Visits Card */}
          <div className="m-2 bg-zinc-100 rounded-2xl shadow-md p-6 flex flex-col overflow-hidden lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-500">
                Latest visits
              </h2>
              <InterfaceButton
                onClick={() => (window.location.href = "/latest-visits")}
                label="View all"
              />
            </div>
            <ul className="flex-grow overflow-hidden">
              {visitsData && visitsData.length > 0 ? (
                visitsData.slice(0, 5).map((item: any) => (
                  <li
                    key={item.id || item.created_at}
                    className="py-2 border-b text-gray-500"
                  >
                    {new Date(item.created_at).toLocaleString()} -{" "}
                    {formatSpotId(item.spot_id)}
                  </li>
                ))
              ) : (
                <li className="py-2 text-gray-500">No data available.</li>
              )}
            </ul>
          </div>

          {/* QR Code Card */}
          <div className="m-2 bg-zinc-100 rounded-2xl shadow-md p-6 flex flex-col overflow-hidden lg:col-span-1">
            <h2 className="text-sm mb-2 text-center text-gray-500">
              <span className="font-bold">QR code</span>
              <span className="font-light"> is valid until </span>
              <span className="font-bold">30.2.2025</span>
            </h2>
            <div className="flex-grow flex items-center justify-center overflow-hidden">
              <div className="w-4/5 aspect-square bg-gray-200 rounded-md">
                {/* QR Code content goes here */}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <InterfaceButton label="Regenerate" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;