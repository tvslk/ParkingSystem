"use client";
import { useEffect } from "react";
import ListWindow from "../components/ListWindow";
import Sidebar from "../components/Sidebar/Sidebar";
import useSWR from "swr";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useDelayedReady } from "../hooks/useDelayedReady";
import LoadingOverlay from "../components/LoadingOverlay";
import UnauthorizedPage from "../unauthorized/page";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function UsersPage() {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();

  const { data: usersData, error } = useSWR("/api/users", fetcher);

  const isReady = useDelayedReady({
    delay: 1000, 
    dependencies: [isLoading, user, adminChecked],
    condition: !isLoading && !!user && adminChecked
  });

  if (!isReady) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div>Error loading users.</div>;
  }

  const headerTitle = "Users";
  const listWindowTitle = "List of all users";

  const formatUser = (user: any) =>
    `${user.name || "Unknown"} (${user.email || "No Email"})`;

  return (
    isAdmin ? 
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full mx-auto">
            <ListWindow
              title={listWindowTitle}
              items={usersData}
              formatItem={formatUser}
            />
          </div>
        </div>
      </div>
    </div> : <UnauthorizedPage />
  );
}