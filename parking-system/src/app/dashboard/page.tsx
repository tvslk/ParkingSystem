"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import InterfaceButton from "../components/InterfaceButtons";

export default function Dashboard() {
  const router = useRouter();
  const defaultData = {
    temperature: "25°C",
    status: "Active",
    uptime: "2 days, 3 hours",
  };
  const [data, setData] = useState(defaultData);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/raspberry", { cache: "no-store" });
      if (!res.ok) {
        console.log("Failed to fetch data");
        setData(defaultData);
        return;
      }
      const result = await res.json();
      setData(result.received || defaultData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(defaultData);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">Dashboard</h1>
        </header>

        {/* Grid Layout */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {/* Available/Occupied Spots Card */}
          <div className="bg-zinc-100 rounded-2xl shadow p-6 lg:col-span-1">
  <div className="flex flex-col">
    <div className="text-6xl font-bold text-emerald-700 mb-2">28</div>
    <div className="text-gray-500 mb-4">
      <span className="font-bold">available</span> parking spots
    </div>
    <div className="text-6xl font-bold text-red-700 mt-4">18</div>
    <div className="text-gray-500">
      <span className="font-bold">occupied</span> parking spots
    </div>
  </div>
</div>

          {/* Parking Lot Image Card */}
          <div className="bg-zinc-100 rounded-2xl shadow p-4 lg:col-span-2 flex flex-col items-center justify-center">
              <img
                src="/map.png"
                alt="Parking Lot"
                className="rounded-lg mb-4 w-full object-cover h-48"
              />
              <InterfaceButton label="Show parking lot" />
          </div>

          {/* Latest Visits Card */}
          <div className="bg-zinc-100 rounded-2xl shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-500">Latest visits</h2>
              <InterfaceButton label="View all" />
            </div>
            <ul>
              <li className="py-2 border-b text-gray-500">19.1.2025 12.39 - prítomnosť</li>
              <li className="py-2 border-b text-gray-500">28.1.2025 11:39 - 29.1.2025 07:49</li>
              <li className="py-2 border-b text-gray-500">28.1.2025 11:39 - 29.1.2025 07:49</li>
              <li className="py-2 text-gray-500">28.1.2025 11:39 - 29.1.2025 07:49</li>
            </ul>
          </div>

          {/* QR Code Card */}
          <div className="bg-zinc-100 rounded-2xl shadow p-6 flex flex-col items-center lg:col-span-1">
            <h2 className="text-sm  mb-2 text-gray-500"> <span className="font-bold">QR code</span>
    <span className="font-light"> is valid until </span>
    <span className="font-bold">30.2.2025</span></h2>
            <div className="w-48 h-48 bg-gray-200 rounded-md mb-4">
              {/* Placeholder for QR Code */}
            </div>
            <InterfaceButton label="Regenerate"/>
          </div>
        </div>
        <footer className="mt-8 p-4  text-center text-gray-500">
          © 2025 Parking System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

