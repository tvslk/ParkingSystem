"use client";
import ListWindow from "../components/ListWindow";
import Sidebar from "../components/Sidebar";
import useSWR from "swr";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useDecodedToken } from "../hooks/DecodedToken";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function UsersPage() {
    const { user, isLoading } = useUser();
  
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (!user) {
      window.location.href = '/api/auth/login';
      return null; 
    }
  
  // Call hooks unconditionally.
  const decoded = useDecodedToken();
  const { data: usersData, error } = useSWR("/api/users", fetcher);

  if (!decoded) {
    return <div>Loading...</div>;
  }

  // Only admin users should see this page.
  if (!decoded.admin) {
    return <div>Unauthorized</div>;
  }

  if (error) return <div>Error loading users.</div>;
  if (!usersData) return <div>Loading users...</div>;

  const headerTitle = "Users";
  const listWindowTitle = "List of all users";

  // Simple formatter for each user.
  const formatUser = (user: any) =>
    `${user.full_name || "Unknown"} (${user.email || "No Email"})`;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-500">{headerTitle}</h1>
        </header>

        {/* Content: Center the ListWindow if there's little data */}
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