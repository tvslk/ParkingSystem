"use client";
import useSWR from "swr";
import Sidebar from "../components/Sidebar";
import InterfaceButton from "../components/InterfaceButtons";
import { useDecodedToken } from "../hooks/DecodedToken";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const formatSpotId = (id: number | string) =>
  "PS" + id.toString().padStart(3, "0");

const handleRedirect = (url: string) => {
  window.location.href = url;
};

export default function Dashboard() {
  const decoded = useDecodedToken();
  const isAdmin = decoded?.admin || false;
  
  const { data: countsData, error: countsError } = useSWR(
    "/api/raspberry?type=counts",
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: visitsData, error: visitsError } = useSWR(
    "/api/latest-visits",
    fetcher,
    { refreshInterval: 5000 }
  );

  const counts = countsData || { available: 0, occupied: 0 };

  if (countsError) {
    console.error("Error fetching counts:", countsError);
  }
  if (visitsError) {
    console.error("Error fetching visits:", visitsError);
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content as a flex column */}
      <div className="flex-1 p-8 flex flex-col min-h-0">
        {/* Header that always stays at the top */}
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-500">Dashboard</h1>
        </header>

        {/* Grid container that grows and scrolls if needed */}
        <div className="flex-grow overflow-auto">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Available/Occupied Spots Card */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-6 lg:col-span-1">
              <div className="flex flex-col">
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
            </div>

            {/* Parking Lot Image Card */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-4 lg:col-span-2 flex flex-col items-center justify-center">
              <img
                src="/map.png"
                alt="Parking Lot"
                className="rounded-lg mb-4 w-full object-cover h-48"
              />
              <InterfaceButton label="Show parking lot" />
            </div>

            {/* Latest Visits / Updates Card */}
            <div
              className={`bg-zinc-100 rounded-2xl shadow-md p-6 ${
                isAdmin ? "lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-500">
                  {isAdmin ? "Latest parking spot updates" : "Latest visits"}
                </h2>
                <InterfaceButton
                  onClick={() => handleRedirect("/latest-visits")}
                  label="View all"
                />
              </div>
              <ul>
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

            {/* QR Code Card (only for non-admin) */}
            {!isAdmin && (
              <div className="bg-zinc-100 rounded-2xl shadow-md p-6 flex flex-col items-center lg:col-span-1">
                <h2 className="text-sm mb-2 text-gray-500">
                  <span className="font-bold">QR code</span>
                  <span className="font-light"> is valid until </span>
                  <span className="font-bold">30.2.2025</span>
                </h2>
                <div className="w-48 h-48 bg-gray-200 rounded-md mb-4">
                  {/* Placeholder for QR Code */}
                </div>
                <InterfaceButton label="Regenerate" />
              </div>
            )}
          </div>
        </div>

        {/* Footer always at the bottom of main content */}
        <footer className="mt-4 flex-shrink-0 text-center text-gray-500">
          © 2025 Parking System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}