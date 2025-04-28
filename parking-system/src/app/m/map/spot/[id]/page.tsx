'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import UnauthorizedPage from '@/app/unauthorized/page';
import ReservationManager from '@/app/components/Reservation/ReservationManager';
import ListWindow from '@/app/components/ListWindow';
import { useAuthStatus } from '@/app/hooks/useAuthStatus';

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

const formatSpotId = (id: number | string) => id.toString().padStart(3, '0');

export default function MobileParkingSpotStatus() {
  const params = useParams();
  const id = params.id as string;

  const { user, isLoading: authLoading, isAdmin } = useAuthStatus();
  const [spotData, setSpotData] = useState<ParkingSpot | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
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
    })();
  }, [id]);

  if (authLoading || loading) {
    return <LoadingOverlay />;
  }
  if (!user || !isAdmin || error) {
    return <UnauthorizedPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Global style override for mobile */}
      <style jsx global>{`
          .reservation-container input {
            font-size: 14px; /* Tailwind's text-sm */
          }
      `}</style>

      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center">
        <Link
          href="/m/map"
          className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl text-gray-500">
          <span className="font-bold">PS</span>
          <span className="font-medium">{formatSpotId(id)}</span>
        </h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center p-2 pb-16">
        <div className="w-full mx-2 flex flex-col space-y-6">
          {/* Spot Status Card */}
          <div className="bg-zinc-100 rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-500 mb-4">Status</h2>
            {spotData && (
              <div className="text-lg text-gray-500">
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(spotData)}`} />
                  <span>
                    {spotData.error
                      ? 'Error'
                      : spotData.reserved
                        ? 'Reserved'
                        : spotData.available
                          ? 'Available'
                          : 'Occupied'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  <strong>Last updated:</strong> {formatCustomDateTime(spotData.last_updated)}
                </p>
              </div>
            )}
          </div>

          {/* Latest visits */}
          <div>
            <ListWindow
              title="Latest visits"
              items={visits.map((v, idx) => ({ ...v, id: idx }))}
              formatItem={formatVisit}
              className="max-h-64 overflow-auto"
            />
          </div>

          {/* Reservation Manager */}
          <div className="reservation-container">
            <ReservationManager />
          </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(spot: ParkingSpot): string {
  if (spot.error) return 'bg-yellow-600';
  if (spot.reserved) return 'bg-red-700';
  return spot.available ? 'bg-emerald-700' : 'bg-red-700';
}

function formatVisit(visit: Visit) {
  const entry = formatCustomDateTime(visit.startDate);
  const exit = visit.endDate ? formatCustomDateTime(visit.endDate) : 'prítomnosť';
  return `${entry} - ${exit}`;
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
    return (
      `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ` +
      `${String(date.getHours()).padStart(2, '0')}:` +
      `${String(date.getMinutes()).padStart(2, '0')}`
    );
  } catch (e) {
    console.error('Invalid date format:', dateString);
    return 'Invalid date';
  }
}