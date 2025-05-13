"use client";

import Link from "next/link";
import BaseSidebar from "./BaseSidebar";

interface AdminSidebarProps {
  fullName: string;
}

const AdminSidebar = ({ fullName }: AdminSidebarProps) => {
  return (
    <BaseSidebar fullName={fullName}>
      {/* Admin-specific links */}
      <Link
        id="users"
        href="/users"
        className="flex items-center px-4 py-2 mt-5 text-gray-500 transition-colors duration-300 transform rounded-md hover:bg-zinc-200 hover:text-gray-700"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="mx-4 font-medium">Users</span>
      </Link>
    </BaseSidebar>
  );
};

export default AdminSidebar;