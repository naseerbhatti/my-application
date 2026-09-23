// client/src/types/dashboard/sidebar/index.ts
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  // roles: ("admin" | "super_admin")[]; // Updated to match usage
  permissionKey?: string;

}

export interface SidebarProps {
  userRole: string;
  userName: string;
  userAvatar?: string;
  navigation: NavItem[];
  isLoading: boolean;
}

export type MenuKey = "overview" | "files" | "rack" | "recordKeeper" | "report";
