import Sidebar from "../Sidebar/Sidebar";
import InterfaceButton from "../Buttons/InterfaceButtons";

const formatSpotId = (id: number | string) =>
  "PS" + id.toString().padStart(3, "0");

interface UserDashboardProps {
  counts: { available: number; occupied: number };
  visitsData: any[];
}

export default function UserDashboard({ counts, visitsData }: UserDashboardProps) {
  return (
    <div className="flex min-h-screen bg-white">
    <Sidebar isAdmin={false} />
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
            <div className="bg-zinc-100 rounded-2xl shadow-md p-4 lg:col-span-2 flex flex-col items-center">
              <div className="flex-grow flex flex-col items-center justify-center w-full">
                <img
                  src="/map.png"
                  alt="Parking Lot"
                  className="rounded-lg mb-4 w-full object-cover h-48"
                />
              </div>
              <div className="w-full flex justify-center mt-4">
                <InterfaceButton label="Show parking lot" />
              </div>
            </div>

            {/* Latest Visits Card - User View */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-500">Latest visits</h2>
                <InterfaceButton
                  onClick={() => (window.location.href = "/latest-visits")}
                  label="View all"
                />
              </div>
              <ul>
                {(visitsData?.length ?? 0) > 0 ? (
                  visitsData.slice(0, 5).map((item: any) => (
                    <li key={item.id || item.created_at} className="py-2 border-b text-gray-500">
                      {new Date(item.created_at).toLocaleString()} - {formatSpotId(item.spot_id)}
                    </li>
                  ))
                ) : (
                  <li className="py-2 text-gray-500">No data available.</li>
                )}
              </ul>
            </div>

            {/* QR Code Card - User View Only */}
            <div className="bg-zinc-100 rounded-2xl shadow-md p-4 lg:col-span-1 flex flex-col h-full">
              <h2 className="text-sm mb-2 text-center text-gray-500">
                <span className="font-bold">QR code</span>
                <span className="font-light"> is valid until </span>
                <span className="font-bold">30.2.2025</span>
              </h2>
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="w-4/5 max-w-[200px] aspect-square bg-gray-200 rounded-md" />
              </div>
              <div className="mt-4 w-full flex justify-center">
                <InterfaceButton label="Regenerate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}