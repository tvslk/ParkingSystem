"use client";

import { useEffect, useState } from "react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import AdminSidebar from "./AdminSidebar";
import BaseSidebar from "./BaseSidebar";


const Sidebar = () => {
  const { user, isLoading, isAdmin, adminChecked } = useAuthStatus();
  
  const fullName = user?.name || "User";
  
  if (isAdmin) {
    return <AdminSidebar fullName={fullName} />;
  } else {
    return <BaseSidebar fullName={fullName} />;
  }
};

export default Sidebar;