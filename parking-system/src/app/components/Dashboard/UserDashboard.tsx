import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar/Sidebar";
import InterfaceButton from "../Buttons/InterfaceButtons";

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

interface UserDashboardProps {
  counts: { available: number; occupied: number };
  visitsData: any[];
}

export default function UserDashboard({ counts, visitsData }: UserDashboardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("—");
  const [qrLoading, setQrLoading] = useState<boolean>(true);
  const [qrError, setQrError] = useState<boolean>(false);
  const [qrRetries, setQrRetries] = useState<number>(0);
  const router = useRouter();

  const fetchQrCode = async (isRetry = false) => {
    if (!isRetry) {
      setQrLoading(true);
      setQrError(false);
    }
    
    try {
      const response = await fetch("/api/qr/generate");
      if (!response.ok) {
        throw new Error(`QR API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.qrCodeDataUrl) {
        setQrDataUrl(data.qrCodeDataUrl);
        if (data?.expiresAt) {
          setQrExpiresAt(formatCustomDateTime(data.expiresAt));
        }
        setQrLoading(false);
        setQrRetries(0); // Reset retry counter on success
      } else {
        throw new Error("No QR code data in response");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setQrError(true);
      setQrLoading(false);
      
      // Auto-retry logic (max 3 retries)
      if (qrRetries < 3) {
        setQrRetries(prev => prev + 1);
        setTimeout(() => {
          fetchQrCode(true);
        }, 2000); // Wait 2 seconds before retry
      }
    }
  };

  const isMounted = useRef(true);

useEffect(() => {
  fetchQrCode();
  
  return () => {
    isMounted.current = false;
  };
}, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-500">Dashboard</h1>
        </header>

        <div className="flex-grow flex flex-col overflow-auto">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-grow pb-8">
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
            <div className="bg-zinc-100 rounded-2xl shadow-md p-4 lg:col-span-2 flex flex-col h-full">
              <div className="flex-1 relative min-h-[300px]">
                <img
                  src="/map.png"
                  alt="Parking Lot"
                  className="rounded-lg absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="w-full flex justify-center mt-4">
                <InterfaceButton
                  id="show-parking-lot"
                  label="Show parking lot"
                  onClick={() => router.push("/map")}
                />
              </div>
            </div>

            {/* Latest Visits Card */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-500">Latest visits</h2>
                <InterfaceButton
                  id="view-all-visits"
                  onClick={() => router.push("/latest-visits")}
                  label="View all"
                />
              </div>
              <ul>
                {visitsData?.length ? (
                  visitsData.slice(0, 5).map((item: any, index: number) => (
                    <li
                      key={`${item.id || item.created_at}-${index}`}
                      className={`py-2 border-b text-gray-500 ${
                        index === 0 ? "border-t" : ""
                      }`}
                    >
                      {formatCustomDateTime(item.created_at)} -{" "}
                      {formatSpotId(item.spot_id)} -{" "}
                      {item.availability === 1 ? "Departed" : "Arrived"}
                    </li>
                  ))
                ) : (
                  <li className="py-2 text-gray-500">No data available.</li>
                )}
              </ul>
            </div>

            {/* QR Code Card */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-4 lg:col-span-1 flex flex-col h-full">
  <h2 className="text-sm mb-2 text-center text-gray-500">
    <span className="font-bold">QR code</span>
    <span className="font-light"> is valid until </span>
    <span className="font-bold">{qrExpiresAt}</span>
  </h2>
  <div className="flex-grow flex items-center justify-center w-full">
    {qrLoading ? (
      <div className="w-4/5 max-w-[200px] aspect-square bg-gray-200 rounded-md flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-zinc-500 rounded-full animate-spin"></div>
      </div>
    ) : qrError ? (
      <div className="w-4/5 max-w-[200px] aspect-square bg-gray-100 rounded-md flex flex-col items-center justify-center p-4">
        <span className="text-red-500 text-sm text-center mb-2">Error loading QR code</span>
        <button 
          onClick={() => {
            setQrRetries(0);
            fetchQrCode();
          }}
          className="text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    ) : (
      <img
        src={qrDataUrl || "/placeholder-qr.png"}
        alt="Gate QR Code"
        className="w-4/5 max-w-[200px] aspect-square border-2 border-gray-300 rounded-md"
        onError={() => {
          console.error("QR image failed to load");
          setQrError(true);
        }}
      />
    )}
  </div>
  <div className="mt-4 w-full flex justify-center">
    <InterfaceButton 
      id="regenerate-qr" 
      label={qrLoading ? "Loading..." : "Regenerate"} 
      onClick={() => fetchQrCode()} 
      disabled={qrLoading}
    />
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}