"use client";

import { useEffect, useState } from "react";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import AdminSidebar from "./AdminSidebar";
import BaseSidebar from "./BaseSidebar";

interface SidebarProps {
    isAdmin: boolean;
  }

const Sidebar = ({ isAdmin }: SidebarProps) => {
  const { user, isLoading } = useAuth0User();
  
  const fullName = user?.name || "User";
  
  if (isAdmin) {
    return <AdminSidebar fullName={fullName} />;
  } else {
    return <BaseSidebar fullName={fullName} />;
  }
};

export default Sidebar;