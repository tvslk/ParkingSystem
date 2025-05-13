"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

interface BaseSidebarProps {
  fullName: string;
  children?: ReactNode; // For additional navigation items
}

const BaseSidebar = ({ fullName, children }: BaseSidebarProps) => {
  const { user } = useAuthStatus();
  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-zinc-100 border-r shadow-xl">
      <Link id="home" href="/" className="block">
        <img className="w-full h-6 sm:h-7" src="/ps-gray.svg" alt="Logo" />
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <Link
            id="dashboard"
            href="/dashboard"
            className="flex items-center px-4 py-2 mt-5 text-gray-500 transition-colors duration-300 transform rounded-md hover:bg-zinc-200 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mx-4 font-medium">Dashboard</span>
          </Link>

          <Link
            id="map"
            href="/map"
            className="flex items-center px-4 py-2 mt-5 text-gray-500 transition-colors duration-300 transform rounded-md hover:bg-zinc-200 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 4L15 7V20L9 17L3 20V7L9 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 7L21 4V17L15 20V7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mx-4 font-medium">Parking lot map</span>
          </Link>

          {/* Additional navigation items will be inserted here */}
          {children}

          <a
            id="logout"
            href="/api/auth/logout"
            className="flex w-full items-center px-4 py-2 mt-5 text-gray-500 transition-colors duration-300 transform rounded-md hover:bg-zinc-200 hover:text-gray-700 focus:outline-none focus:bg-zinc-200 focus:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 16l4-4-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mx-4 font-medium">Log out</span>
          </a>
        </nav>

        <div className="border-t pt-4">
          <Link id="profile" href="/profile" className="flex items-center px-4 -mx-2">
            <img
              className="object-cover mx-2 rounded-full h-9 w-9"
              src={user?.picture || "/avatar.png"}
              alt="Parking system user"
            />
            <span className="mx-2 font-semibold text-gray-500">{fullName}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default BaseSidebar;