"use client";
import { useEffect } from "react";
import ListWindow from "../components/ListWindow";
import Sidebar from "../components/Sidebar";
import useSWR from "swr";
import { useUser } from "@auth0/nextjs-auth0/client";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function UsersPage() {
  const { user, isLoading } = useUser();

  const { data: usersData, error } = useSWR("/api/users", fetcher);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/auth/login";
    }
  }, [isLoading, user]);

  if (isLoading || !usersData) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users.</div>;
  }

  const headerTitle = "Users";
  const listWindowTitle = "List of all users";

  const formatUser = (user: any) =>
    `${user.full_name || "Unknown"} (${user.email || "No Email"})`;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto">
            <ListWindow
              title={listWindowTitle}
              items={usersData}
              formatItem={formatUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}