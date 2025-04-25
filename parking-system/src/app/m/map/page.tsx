"use client";
import { useState } from "react";
import useSWR from "swr";
import { useDelayedReady } from "../../hooks/useDelayedReady";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import LoadingOverlay from "../../components/LoadingOverlay";

interface ParkingSpot {
  spot_id: number;
  available: boolean;
  reserved: boolean;
  error: boolean;
}

interface SpotsResponse {
  spots: ParkingSpot[];
  total: number;
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

const spotsPerPage = 12;

export default function Map() {
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  // Delay rendering until auth checks complete
  const isReady = useDelayedReady({
    delay: 1000,
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked,
  });

  const { data: spotsData } = useSWR<SpotsResponse>(
    isReady
      ? `/api/parking-spot?page=${currentPage}&limit=${spotsPerPage}&sort=spot_id&order=asc`
      : null,
    fetcher
  );

  const spotDetail = (spotId: number) => {
    window.location.href = `/m/map/spot/${spotId}`;
  };

  if (!isReady) {
    return <LoadingOverlay />;
  }

  const getSpotLabel = (spot: ParkingSpot) => {
    if (spot.error) return "Error";
    if (spot.reserved) return "Reserved";
    if (spot.available) return "Available";
    return "Occupied";
  };

  const getStatusColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "error":
        return "bg-yellow-600";
      case "reserved":
        return "bg-red-700";
      case "available":
        return "bg-emerald-700";
      default:
        return "bg-red-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-500">Parking Lot Map</h1>
      </header>

      <main className="flex-1 flex items-start justify-center p-2">
        <div className="w-full mx-2">
          <div className="bg-zinc-100 rounded-2xl shadow-md p-4 flex flex-col flex-grow">
          {/* Vertical list of parking spots */}
          <div className="grid grid-cols-2 gap-4">
          {spotsData?.spots?.map((spot) => {
              const label = getSpotLabel(spot);
              return (
                <div
                  key={spot.spot_id}
                  className="flex items-center justify-between border border-zinc-300 rounded-xl p-4 hover:scale-[1.01] transition-transform cursor-pointer"
                  onClick={() => {
                    if (isAdmin) {
                      spotDetail(spot.spot_id);
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-lg text-zinc-500">
                      <span className="font-bold">PS</span>
                      <span className="font-medium">
                        {spot.spot_id.toString().padStart(3, "0")}
                      </span>
                    </span>
                    <span className="text-xs text-zinc-500">{label}</span>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(label)}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination (legend removed for space) */}
          <div className="mt-4 self-center w-full">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil((spotsData?.total || 0) / spotsPerPage)}
              onPageChange={setCurrentPage}
            />
         </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Pagination Controls (unchanged) */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    i + Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  );

  return (
    <div className="flex justify-center items-center w-full bg-white rounded-lg shadow p-2">
      <ul className="flex items-center gap-2 w-full justify-between">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`h-8 px-4 py-1 text-sm font-medium text-gray-600 rounded-lg flex items-center gap-1
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
            `}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.325 14.825C11.175 14.825 11.025 14.775 10.925 14.65L5.27495 8.90002C5.04995 8.67502 5.04995 8.32503 5.27495 8.10002L10.925 2.35002C11.15 2.12502 11.5 2.12502 11.725 2.35002C11.95 2.57502 11.95 2.92502 11.725 3.15002L6.47495 8.50003L11.75 13.85C11.975 14.075 11.975 14.425 11.75 14.65C11.6 14.75 11.475 14.825 11.325 14.825Z"
                fill="currentColor"
              />
            </svg>
            Prev
          </button>
        </li>
        {pageNumbers.map((pageNumber, index) => (
          <li key={index}>
            {pageNumber < 0 ? (
              <span className="h-8 flex items-center px-2 text-gray-600">…</span>
            ) : (
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 w-8 px-2 text-sm rounded-lg 
                  ${
                    currentPage === pageNumber
                      ? "bg-zinc-500 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-gray-100"
                  }`}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`h-8 px-4 py-1 text-sm font-medium text-gray-600 rounded-lg flex items-center gap-1
              ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
            `}
          >
            Next
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.67495 14.825C5.52495 14.825 5.39995 14.775 5.27495 14.675C5.04995 14.45 5.04995 14.1 5.27495 13.875L10.525 8.50003L5.27495 3.15002C5.04995 2.92502 5.04995 2.57502 5.27495 2.35002C5.49995 2.12502 5.84995 2.12502 6.07495 2.35002L11.725 8.10002C11.95 8.32503 11.95 8.67502 11.725 8.90002L6.07495 14.65C5.97495 14.75 5.82495 14.825 5.67495 14.825Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  );
};