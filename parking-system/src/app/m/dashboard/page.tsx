'use client';
import { useEffect, useState } from "react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import InterfaceButton from "@/app/components/Buttons/InterfaceButtons";

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

const useDashboardData = () => {
  const [counts, setCounts] = useState({ available: 0, occupied: 0 });
  const [visitsData, setVisitsData] = useState<any[]>([]);
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/spot-info?type=counts", { cache: "no-store" });
        const data = await res.json();
        setCounts(data || { available: 0, occupied: 0 });
      } catch (e) {
        setCounts({ available: 0, occupied: 0 });
      }
    };

    const fetchVisits = async () => {
      try {
        const res = await fetch("/api/latest-visits", { cache: "no-store" });
        const data = await res.json();
        setVisitsData(Array.isArray(data) ? data : []);
      } catch (e) {
        setVisitsData([]);
      }
    };

    fetchCounts();
    fetchVisits();

    const interval = setInterval(() => {
      fetchCounts();
      fetchVisits();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  return { counts, visitsData };
};

export default function MobileDashboardPage() {
  const { isAdmin } = useAuthStatus();
  const { counts, visitsData } = useDashboardData();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("—");
  const fetchQrCode = async () => {
    try {
      const response = await fetch("/api/qr/generate");
      const data = await response.json();
      if (data?.qrCodeDataUrl) setQrDataUrl(data.qrCodeDataUrl);
      if (data?.expiresAt) setQrExpiresAt(formatCustomDateTime(data.expiresAt));
    } catch (error) {
      setQrDataUrl(null);
      setQrExpiresAt("—");
    }
  };
  useEffect(() => {
    if (!isAdmin) fetchQrCode();
  }, [isAdmin]);

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
            {qrDataUrl ? (
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
      <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col items-left">
        <div className="flex flex-col items-left">
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
      <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-row items-center justify-between">
        <div className="text-gray-500 text-left">See the parking lot map</div>
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