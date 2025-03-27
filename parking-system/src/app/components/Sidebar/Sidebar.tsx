"use client";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import AdminSidebar from "./AdminSidebar";
import BaseSidebar from "./BaseSidebar";

const Sidebar = () => {
  const { isAdmin, user } = useAuthStatus();
  const fullName = user?.name || "User";

  if (isAdmin) {
    return <AdminSidebar fullName={fullName} />;
  } else {
    return <BaseSidebar fullName={fullName} />;
  }
};

export default Sidebar;