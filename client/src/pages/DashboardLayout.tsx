import React from "react";
import { Sidebar } from "../components/layout/dashboard/sidebar";
import { Outlet } from "react-router-dom";
import {
  AlignVerticalSpaceAround,
  Box,
  File,
  Files,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { NavItem } from "../types/dashboard/sidebar";
import { useApiGetMeQuery } from "../redux/api";

export default function DashboardLayout() {
  const { data, isLoading } = useApiGetMeQuery({});
  const user = data?.data?.user;

  const hasAccess = (perm?: string[]) => {
    return Array.isArray(perm) && perm.includes("READ");
  };

  const permissions = user?.permissions || {};

  const menuItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      permissionKey: "DASHBOARD",
    },
    {
      name: "Files",
      icon: File,
      href: "/files",
      permissionKey: "FILE",
    },
    {
      name: "Rack Management",
      icon: Box,
      href: "/rack-management",
      permissionKey: "RACK",
    },
    {
      name: "User Management",
      icon: User,
      href: "/user-management",
      permissionKey: "USER",
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.permissionKey ? hasAccess(permissions[item.permissionKey]) : true,
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar
        userRole={user?.role || "Viewer"}
        userName={user?.name?.toUpperCase() || "User"}
        userAvatar={user?.avatar || user?.name}
        navigation={filteredMenu}
        isLoading= {isLoading}
      />
      {/* Main Content */}
      <main className="flex-1 lg:ml-52 p-3 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
