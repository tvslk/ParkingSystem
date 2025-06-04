"use client";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import AdminSidebar from "./AdminSidebar";
import BaseSidebar from "./BaseSidebar";

const Sidebar = () => {
  const { isAdmin, user } = useAuthStatus();

  let rawName = user?.name || user?.nickname || user?.email || "User";
  let sanitizedName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
  sanitizedName =
    sanitizedName.length > 25 ? sanitizedName.slice(0, 25) + "…" : sanitizedName;

  if (isAdmin) {
    return <AdminSidebar fullName={sanitizedName} />;
  } else {
    return <BaseSidebar fullName={sanitizedName} />;
  }
};

export default Sidebar;