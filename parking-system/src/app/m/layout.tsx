'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from '@/app/hooks/useAuthStatus';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/m';
  const { isAdmin, user } = useAuthStatus();

  // For admin: dashboard, map, users, logout, profile => 5 icons
  // For user: dashboard, map, logout, profile => 4 icons
  const navCols = isAdmin ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        {/* Make header a fixed height (e.g. h-14) so nav can match */}
        {!hideNavbar && (
          <header className="w-full h-14 flex items-center justify-center bg-white border-b border-gray-200">
            <a href="/m/dashboard" id="home">
              <img src="https://i.ibb.co/kt3XqSC/ps-gray.png" alt="Parking System Logo" className="h-8" />
            </a>          
            </header>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>

        {!hideNavbar && (
          <nav className="fixed bottom-0 left-0 right-0 h-14 flex items-center bg-white border-t border-gray-200">
            {/* Use grid with full height to match header */}
            <div className={`grid ${navCols} w-full h-full gap-1 px-2 items-center justify-items-center`}>
              {/* Dashboard */}
              <a href="/m/dashboard" id="dashboard" className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" />
                </svg>
              </a>

              {/* Map */}
              <a href="/m/map" id="dashboard" className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 4L15 7V20L9 17L3 20V7L9 4Z" />
                  <path d="M15 7L21 4V17L15 20V7Z" />
                </svg>
              </a>

              {/* Admin-only users icon */}
              {isAdmin && (
                <a href="/m/users" id="users" className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                  </svg>
                </a>
              )}

              {/* Logout */}
              <a
                href="/api/auth/logout"
                id="logout"
                className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
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
              </a>

              {/* Profile */}
              <a href="/m/profile" id="profile" className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full">
                <img
                  className="object-cover rounded-full h-8 w-8"
                  src={user?.picture || "/avatar.png"}
                  alt="Parking system user"
                />
              </a>
            </div>
          </nav>
        )}
      </body>
    </html>
  );
}