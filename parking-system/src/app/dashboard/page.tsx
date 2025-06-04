"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useDelayedReady } from "../hooks/useDelayedReady";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import UserDashboard from "../components/Dashboard/UserDashboard";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function Dashboard() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  const { data: countsData, error: countsError } = useSWR(
    user ? "/api/spot-info?type=counts" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: visitsData, error: visitsError } = useSWR(
    user ? "/api/latest-visits" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: userVisitsData, error: userVisitsError } = useSWR(
    isAdmin ? "/api/latest-visits/user" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // NEW: Fetch the current user's personal visits
  const { data: myVisitsData, error: myVisitsError } = useSWR(
    user && !isAdmin ? `/api/latest-visits/user/${user.sub}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const isReady = useDelayedReady({
    delay: 1000,
    dependencies: [isLoading, user, adminChecked, countsData, visitsData, userVisitsData, myVisitsData],
    condition: !isLoading && !!user && adminChecked && ((isAdmin && userVisitsData) || (!isAdmin && myVisitsData)),
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (countsError) console.error("Error fetching counts:", countsError);
  if (visitsError) console.error("Error fetching visits:", visitsError);
  if (userVisitsError) console.error("Error fetching user visits:", userVisitsError);
  if (myVisitsError) console.error("Error fetching my visits:", myVisitsError);

  const counts = countsData || { available: 0, occupied: 0 };

  if (isAdmin) {
    return <AdminDashboard counts={counts} visitsData={visitsData} userVisitsData={userVisitsData} />;
  } else {
    return <UserDashboard counts={counts} myVisitsData={myVisitsData || []} />;
  }
}