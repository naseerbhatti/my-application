import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/src/components/ui/button"; // ShadCN Button
import { cn } from "@/src/lib/utils"; // Keep using your utility function for conditional classes
import { SidebarProps } from "@/src/types/dashboard/sidebar";
import { useApiLogoutMutation } from "@/src/redux/api";
import { useSelector } from "react-redux";
import SidebarSkeleton from "../../Skeleton/SidebarSkeleton";

export function Sidebar({
  userRole,
  userName,
  userAvatar,
  navigation,
  isLoading,
}: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const filteredNavigation = navigation;
  const [imgError, setImgError] = useState(false);

  const avatarUrl = Array.isArray(userAvatar) ? userAvatar[0] : userAvatar;

  const isValidAvatar =
    typeof avatarUrl === "string" && avatarUrl.trim() !== "";

  const [logout] = useApiLogoutMutation();

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="flex flex-col items-start w-full gap-4 px-6 py-4 ">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 w-full">
          <img
            src="/assets/auth/sbcaLogo.png"
            alt="SBCA Logo"
            width={50}
            height={49}
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">
              SBCA
            </span>
            <span className="text-sm text-gray-600">Library System</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 max-w-[271px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const IconComponent = item.icon;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-[#047857]  text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center justify-between w-full">
          {/* Left Side */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {isValidAvatar && !imgError ? (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {userName
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>

            <Link to="/profile" className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName
                  ?.split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(" ")}
              </p>

              <p className="text-xs text-gray-500">
                {userRole
                  ?.replaceAll("_", " ")
                  .split(" ")
                  .map(
                    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                  )
                  .join(" ")}
              </p>
            </Link>
          </div>

          {/* Right Side Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed  top-4 left-4 z-[9999]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white border border-gray-200  shadow-none"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4 border-0 outline-none" />
          ) : (
            <Menu className="h-4 w-4   " />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed    inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-52 lg:flex-col lg:fixed lg:inset-y-0  border-r border-gray-200">
        {isLoading ? <SidebarSkeleton /> : <SidebarContent />}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 mt-auto z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {isLoading ? <SidebarSkeleton /> : <SidebarContent />}
      </aside>
    </>
  );
}
