'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/app/components/Sidebar/Sidebar";
import InterfaceButton from "@/app/components/Buttons/InterfaceButtons";
import { useAuthStatus } from '@/app/hooks/useAuthStatus';

// Update interfaces to match your API response
interface ParkingSpot {
  spot_id: number;
  available: boolean;
  error: boolean;
  last_updated: string;
}

interface Visit {
  id: number;
  spot_id: number;
  status: string;
  timestamp: string;
  license_plate?: string;
}

const formatSpotId = (id: number | string) => 
  "PS" + id.toString().padStart(3, "0");

export default function ParkingSpotStatus() {
  // Use useParams instead of useRouter
  const params = useParams();
  const id = params.id as string;
  
  const { user, isLoading: authLoading } = useAuthStatus();
  const [spotData, setSpotData] = useState<ParkingSpot | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const spot = await getSpotData(id);
        const visits = await getVisitHistory(id);
        setSpotData(spot);
        setVisits(visits);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (authLoading) return <div>Loading authentication...</div>;
  if (!user) return <div>Please login to view this page</div>;
  if (loading) return <div>Loading spot information...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-8 flex items-center">
          <Link 
            href="/map" 
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-500">
            {formatSpotId(id)}
          </h1>
        </header>

        <div className="flex-grow flex flex-col gap-8">
          {/* Status Card */}
          <div className="bg-zinc-100 rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-500 mb-4">Status</h2>
            {spotData && (
              <div className="text-lg text-gray-500">
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(spotData)}`}></div>
                  <span>
                    {spotData.error 
                      ? "Error" 
                      : spotData.available 
                        ? "Available" 
                        : "Occupied"}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                    Last updated: {formatCustomDateTime(spotData.last_updated)}
                </p>
              </div>
            )}
          </div>

          {/* Latest Visits Card */}
          <div className="bg-zinc-100 rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-500">Latest visits</h2>
            </div>
            <ul className="space-y-4">
              {visits.length > 0 ? (
                visits.map((visit) => (
                  <li 
                    key={visit.id} 
                    className="text-gray-500 flex justify-between items-center p-3 bg-white rounded-lg"
                  >
                    <span>
                        {formatCustomDateTime(visit.timestamp)}
                    </span>
                    <div className="flex items-center">
                      {visit.license_plate && (
                        <span className="mr-4 px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {visit.license_plate}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm text-white ${
                        visit.status === 'Available' 
                          ? 'bg-green-500' 
                          : visit.status === 'Occupied' 
                            ? 'bg-red-500' 
                            : 'bg-yellow-500'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No visit history found</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get status color
function getStatusColor(spot: ParkingSpot): string {
  if (spot.error) return 'bg-yellow-600';
  return spot.available ? 'bg-emerald-700' : 'bg-red-700';
}

// API calls
async function getSpotData(id: string): Promise<ParkingSpot> {
  const response = await fetch(
    `/api/parking-spot/${id}`,
    { cache: 'no-store' }
  );
  if (!response.ok) throw new Error('Failed to fetch spot data');
  return response.json();
}

async function getVisitHistory(id: string): Promise<Visit[]> {
  const response = await fetch(
    `/api/latest-visits/${id}`,
    { cache: 'no-store' }
  );
  if (!response.ok) throw new Error('Failed to fetch visit history');
  return response.json();
}

function formatCustomDateTime(dateString: string): string {
    try {
      const isoDate = new Date(dateString);
      
      if (!isNaN(isoDate.getTime())) {
        return `${isoDate.getDate()}.${isoDate.getMonth() + 1}.${isoDate.getFullYear()} ${String(isoDate.getHours()).padStart(2, '0')}:${String(isoDate.getMinutes()).padStart(2, '0')}`;
      }
  
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      return `${day}.${month}.${year} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
    } catch (e) {
      return 'Invalid date';
    }
  }
  