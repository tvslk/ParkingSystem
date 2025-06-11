"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const useDashboardData = () => {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  const [counts, setCounts] = useState({ available: 0, occupied: 0 });
  const [visitsData, setVisitsData] = useState<any[]>([]);
  const [userVisitsData, setUserVisitsData] = useState<any[]>([]);
  const [myVisitsData, setMyVisitsData] = useState<any[]>([]);

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

    const fetchUserVisits = async () => {
      if (!isAdmin) return;
      try {
        const res = await fetch("/api/latest-visits/user", { cache: "no-store" });
        const data = await res.json();
        setUserVisitsData(Array.isArray(data) ? data : []);
      } catch (e) {
        setUserVisitsData([]);
      }
    };

    const fetchMyVisits = async () => {
      if (!user || isAdmin) return;
      try {
        const res = await fetch(`/api/latest-visits/user/${user.sub}`, { cache: "no-store" });
        const data = await res.json();
        setMyVisitsData(Array.isArray(data.visits) ? data.visits : []);
      } catch (e) {
        setMyVisitsData([]);
      }
    };

    fetchCounts();
    fetchVisits();
    
    if (isAdmin) {
      fetchUserVisits();
    } else if (user) {
      fetchMyVisits();
    }

    const interval = setInterval(() => {
      fetchCounts();
      fetchVisits();
      if (isAdmin) {
        fetchUserVisits();
      } else if (user) {
        fetchMyVisits();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin, user]);

  return { counts, visitsData, userVisitsData, myVisitsData };
};

export default function MobileDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading, adminChecked, user } = useAuthStatus();
  const { counts, visitsData, userVisitsData, myVisitsData } = useDashboardData();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("—");
  const [qrLoading, setQrLoading] = useState<boolean>(true);
  const [qrError, setQrError] = useState<boolean>(false);
  const [qrRetries, setQrRetries] = useState<number>(0);

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

  useEffect(() => {
    if (!isAdmin) fetchQrCode();
  }, [isAdmin]);

  if (isLoading || !user || !adminChecked || !counts) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white min-h-screen pb-16">
      {/* QR Code Card (users only) */}
      {!isAdmin && (
        <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col items-center">
          <h2 className="text-sm mb-2 text-center text-gray-500">
            <span className="font-bold">QR code</span>
            <span className="font-light"> is valid until </span>
            <span className="font-bold">{qrExpiresAt}</span>
          </h2>
          <div className="flex items-center justify-center w-full">
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
          id="show-parking-lot"
          label="Show parking lot"
          onClick={() => router.push("/m/map")}
        />
      </div>

      {/* Admin: Latest Updates Card */}
      {isAdmin && (
        <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-500">
              Latest parking spot updates
            </h2>
            <InterfaceButton
              id="view-all-visits"
              onClick={() => router.push("/m/latest-visits")}
              label="View all"
            />
          </div>
          <ul>
            {(visitsData?.length ?? 0) > 0 ? (
              visitsData.slice(0, 4).map((item: any, index: number) => (
                <li
                  key={`${item.id || item.created_at}-${index}`}
                  className={`py-2 border-b text-gray-500 ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  <span className="font-bold">{formatSpotId(item.spot_id)}</span>
                  {" – "}
                  {item.availability === 1 ? "Arrived" : "Departed"}
                  {" – "}
                  {formatCustomDateTime(item.created_at)}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500">No data available.</li>
            )}
          </ul>
        </div>
      )}

      {/* Admin: Latest User Visits Card */}
      {isAdmin && (
        <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-500">
              Latest user visits
            </h2>
            <InterfaceButton
              id="view-all-user-visits"
              onClick={() => router.push("/m/latest-visits/user")}
              label="View all"
            />
          </div>
          <ul>
            {(userVisitsData?.length ?? 0) > 0 ? (
              userVisitsData.slice(0, 4).map((item: any, index: number) => {
                const rawName =
                  item.user?.name ||
                  item.user?.nickname ||
                  item.user?.email ||
                  "Unknown";
                let sanitizedName = rawName.includes("@")
                  ? rawName.split("@")[0]
                  : rawName;
                sanitizedName =
                  sanitizedName.length > 18
                    ? sanitizedName.slice(0, 18) + "…"
                    : sanitizedName;

                return (
                  <li
                    key={`${item.id}-${index}`}
                    className={`py-2 border-b text-gray-500 ${
                      index === 0 ? "border-t" : ""
                    }`}
                  >
                    <span className="font-semibold">{sanitizedName}</span>
                    {" — "}
                    {formatCustomDateTime(item.start_date)}
                    {item.end_date && (
                      <> &rarr; {formatCustomDateTime(item.end_date)}</>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="py-2 text-gray-500">
                No user visits available.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* User: My Visits Card */}
      {!isAdmin && (
        <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-500">My visits</h2>
            <InterfaceButton
              id="view-all-my-visits"
              onClick={() => router.push(`/m/latest-visits/user/${user.sub}`)}
              label="View all"
            />
          </div>
          <ul>
            {(myVisitsData?.length ?? 0) > 0 ? (
              myVisitsData.slice(0, 4).map((item: any, index: number) => (
                <li
                  key={`${item.id}-${index}`}
                  className={`py-2 border-b text-gray-500 ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  {formatCustomDateTime(item.start_date)}
                  {item.end_date ? (
                    <> &rarr; {formatCustomDateTime(item.end_date)}</>
                  ) : (
                    <> &mdash; Active Visit</>
                  )}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500">No personal visits recorded yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}