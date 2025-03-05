"use client";

import ListWindow from '../components/ListWindow';
import Sidebar from '../components/Sidebar';
import useSWR from 'swr';

// Simple fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper to format spot id like "ps001"
const formatSpotId = (spotId: number | string) =>
    "PS" + spotId.toString().padStart(3, "0");

// Format a visit item (assuming it has created_at and spot_id properties)
const formatVisit = (visit: any) =>
    `${new Date(visit.created_at).toLocaleString()} - ${formatSpotId(visit.spot_id)}`;

export default function LatestVisits() {
    // Retrieve visits from an API endpoint using SWR
    const { data: visitsData, error } = useSWR('/api/latest-visits', fetcher);

    if (error) return <div>Error loading visits.</div>;
    if (!visitsData) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-7xl">
                    <ListWindow
                        title="Latest visits"
                        items={visitsData}
                        formatItem={formatVisit}
                    />
                </div>
            </main>
        </div>
    );
}