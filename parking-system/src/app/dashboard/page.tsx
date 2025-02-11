"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState({
    temperature: "25°C",
    status: "Active",
    uptime: "2 days, 3 hours",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  useEffect(() => {
    setTimeout(() => {
      setData({
        temperature: "26°C",
        status: "Active",
        uptime: "2 days, 5 hours",
      });
    }, 3000); 
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <ul>
          <li className="mb-4">
            <a href="#" className="hover:bg-gray-700 p-2 rounded-md">Home</a>
          </li>
          
          <li className="mb-4">
            <a href="#" onClick={handleLogout} className="hover:bg-gray-700 p-2 rounded-md">Logout</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Raspberry Pi Dashboard</h1>
        </header>

        {/* Raspberry Pi Mock Data */}
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

        {/* Recent Activity */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            <li className="bg-gray-100 p-4 rounded-md shadow-md">
              <p className="font-semibold">Temperature Reading</p>
              <p className="text-sm text-gray-600">Updated: {data.temperature}</p>
            </li>
            <li className="bg-gray-100 p-4 rounded-md shadow-md">
              <p className="font-semibold">System Status</p>
              <p className="text-sm text-gray-600">Status: {data.status}</p>
            </li>
            <li className="bg-gray-100 p-4 rounded-md shadow-md">
              <p className="font-semibold">Uptime Update</p>
              <p className="text-sm text-gray-600">Uptime: {data.uptime}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}