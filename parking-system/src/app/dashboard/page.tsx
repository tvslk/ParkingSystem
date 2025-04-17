"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import InterfaceButton from "@/app/components/Buttons/InterfaceButtons";
import LoadingOverlay from "@/app/components/LoadingOverlay";

function formatCustomDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}.${String(
    date.getMonth() + 1
  ).padStart(2, '0')}.${date.getFullYear()} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const formatSpotId = (id: number | string) =>
  "PS" + id.toString().padStart(3, "0");

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function MobileDashboardPage() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  const { data: countsData, error: countsError } = useSWR(
    user ? "/api/spot-info?type=counts" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: visitsData, error: visitsError } = useSWR(
    user ? "/api/latest-visits" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // QR code logic (users only)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("—");
  const [qrLoading, setQrLoading] = useState(false);

  const fetchQrCode = async () => {
    setQrLoading(true);
    try {
      const response = await fetch("/api/qr/generate");
      const data = await response.json();
      if (data?.qrCodeDataUrl) setQrDataUrl(data.qrCodeDataUrl);
      if (data?.expiresAt) setQrExpiresAt(formatCustomDateTime(data.expiresAt));
    } catch (error) {
      setQrDataUrl(null);
      setQrExpiresAt("—");
    }
    setQrLoading(false);
  };

  useEffect(() => {
    if (!isAdmin && user) fetchQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user]);

  // Loading state
  if (isLoading || !user || !adminChecked || !countsData) {
    return <LoadingOverlay />;
  }

  if (countsError) console.error("Error fetching counts:", countsError);
  if (visitsError) console.error("Error fetching visits:", visitsError);

  const counts = countsData || { available: 0, occupied: 0 };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white min-h-screen">
      {/* QR Code Card (users only) */}
      {!isAdmin && (
        <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col items-center">
          <h2 className="text-sm mb-2 text-center text-gray-500">
            <span className="font-bold">QR code</span>
            <span className="font-light"> is valid until </span>
            <span className="font-bold">{qrExpiresAt}</span>
          </h2>
          <div className="flex items-center justify-center w-full">
            {qrDataUrl && !qrLoading ? (
              <img
                src={qrDataUrl}
                alt="Gate QR Code"
                className="w-4/5 max-w-[200px] aspect-square border-2 border-gray-300 rounded-md"
              />
            ) : (
              <div className="w-4/5 max-w-[200px] aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                <span className="text-gray-600 text-sm">Loading...</span>
              </div>
            )}
          </div>
          <div className="mt-4 w-full flex justify-center">
            <InterfaceButton label="Regenerate" onClick={fetchQrCode} />
          </div>
        </div>
      )}

      {/* Available/Occupied Spots Card */}
      <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col items-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-emerald-700 mb-2">
            {counts.available}
          </div>
          <div className="text-gray-500 mb-4">
            <span className="font-bold">available</span> spots
          </div>
          <div className="text-6xl font-bold text-red-700 mt-4">
            {counts.occupied}
          </div>
          <div className="text-gray-500">
            <span className="font-bold">occupied</span> spots
          </div>
        </div>
      </div>

      {/* Show Parking Lot Button */}
      <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col items-center">
        <div className="text-gray-500 mb-2 text-center">See the parking lot map</div>
        <InterfaceButton
          label="Show parking lot"
          onClick={() => (window.location.href = "/m/map")}
        />
      </div>

      {/* Latest Visits/Updates Card */}
      <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-500">
            {isAdmin ? "Latest parking spot updates" : "Latest visits"}
          </h2>
          <InterfaceButton
            onClick={() => (window.location.href = "/m/latest-visits")}
            label="View all"
          />
        </div>
        <ul>
          {(visitsData?.length ?? 0) > 0 ? (
            visitsData.slice(0, 5).map((item: any, index: number) => (
              <li
                key={`${item.id || item.created_at}-${index}`}
                className={`py-2 border-b text-gray-500 ${index === 0 ? "border-t" : ""}`}
              >
                {formatCustomDateTime(item.created_at)} - {formatSpotId(item.spot_id)} - {item.availability === 1 ? "Departed" : "Arrived"}
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-500">No data available.</li>
          )}
        </ul>
      </div>
    </div>
  );
}