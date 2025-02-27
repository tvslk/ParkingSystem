"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      // Use result.received if available, otherwise fallback to defaultData.
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <ul>
          <li className="mb-4">
            <a href="#" className="hover:bg-gray-700 p-2 rounded-md">
              Home
            </a>
          </li>
          <li className="mb-4">
            <a
              href="#"
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/signin");
              }}
              className="hover:bg-gray-700 p-2 rounded-md"
              id="logout"
            >
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Raspberry Pi Dashboard
          </h1>
        </header>

        {/* Data Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Temperature</h3>
            <p className="text-3xl text-gray-900">{data.temperature}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Status</h3>
            <p className="text-3xl text-gray-900">{data.status}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Uptime</h3>
            <p className="text-3xl text-gray-900">{data.uptime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}