'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/app/components/Sidebar/Sidebar";
import InterfaceButton from "@/app/components/Buttons/InterfaceButtons";
import { useAuthStatus } from '@/app/hooks/useAuthStatus';
import ListWindow from '@/app/components/ListWindow';
import LoadingOverlay from '@/app/components/LoadingOverlay';

interface ParkingSpot {
    spot_id: number;
    available: boolean;
    last_updated: string;
    reserved?: boolean;
    error?: boolean;
  }

interface Visit {
    startDate: string;
    endDate?: string;
  }

const formatSpotId = (id: number | string) => 
  "PS" + id.toString().padStart(3, "0");

export default function ParkingSpotStatus() {
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

  const formatVisit = (visit: Visit) => {
    const entryDate = formatCustomDateTime(visit.startDate);
    const exitDate = visit.endDate 
      ? formatCustomDateTime(visit.endDate)
      : 'prítomnosť';
    return `${entryDate} - ${exitDate}`;
  };
  

if (authLoading || loading) {
    return <LoadingOverlay />; 
}

if (error) {
    useEffect(() => {
        window.location.href = "/404";
    }, []);

    return null;
}

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
          {/* Reservation Status */}
          {spotData?.reserved && (
            <div className="bg-zinc-100 rounded-2xl shadow-md p-6">
              <div className="text-lg text-gray-500 space-y-4">
                <p className="font-medium">Parking spot is currently reserved</p>
                <InterfaceButton 
                  label="Cancel reservation" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Spot Status Card */}
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

          {/* Latest Visits with ListWindow */}
          <ListWindow
            title="Latest visits"
            items={visits.map((v, index) => ({ ...v, id: index }))} // Add temporary IDs for rendering
            formatItem={formatVisit}
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions and API calls
function getStatusColor(spot: ParkingSpot): string {
  if (spot.error) return 'bg-yellow-600';
  return spot.available ? 'bg-emerald-700' : 'bg-red-700';
}

async function getSpotData(id: string): Promise<ParkingSpot> {
  const response = await fetch(`/api/parking-spot/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch spot data');
  return response.json();
}

async function getVisitHistory(id: string): Promise<Visit[]> {
    const response = await fetch(`/api/latest-visits/spot/${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) throw new Error('Failed to fetch visit history');
    return response.json();
  }

function formatCustomDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ` +
           `${String(date.getHours()).padStart(2, '0')}:` +
           `${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    console.error('Invalid date format:', dateString);
    return 'Invalid date';
  }
}