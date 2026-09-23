import React from "react";
import { Badge } from "../ui/badge";

export type StatusType =
  | "pending"
  | "approved"
  | "completed"
  | "passed"
  | "submitted"
  | "rejected"
  | "cancelled"
  | "dropout"
  | "failed"
  | "eliminated"
  | "enrolled"
  | "active"
  | "not_attempted"
  | "present"
  | "leave"
  | "missing"
  | "available"
  | "issued"
  | "inactive"
  | "default";

/**
 * Status → Tailwind styles map
 */
const statusStyles: Record<StatusType, string> = {
  pending:
    "bg-clr_amber_bg text-clr_amber_dark border-clr_amber_border hover:bg-clr_amber_hover",
  approved:
    "bg-clr_emerald_bg text-clr_emerald_dark border-clr_emerald_border hover:bg-clr_emerald_hover",
  completed:
    "bg-clr_emerald_bg text-clr_emerald_dark border-clr_emerald_border hover:bg-clr_emerald_hover",
  passed:
    "bg-clr_emerald_bg text-clr_emerald_dark border-clr_emerald_border hover:bg-clr_emerald_hover",
  submitted:
    "bg-clr_blue_bg text-clr_blue_dark border-clr_blue_border hover:bg-clr_blue_hover",
  rejected:
    "bg-clr_rose_bg_light text-clr_rose_dark border-clr_rose_border hover:bg-clr_rose_hover",
  cancelled:
    "bg-clr_rose_bg_light text-clr_rose_dark border-clr_rose_border hover:bg-clr_rose_hover",
  dropout:
    "bg-clr_rose_bg_light text-clr_rose_dark border-clr_rose_border hover:bg-clr_rose_hover",
  failed:
    "bg-clr_rose_bg_light text-clr_rose_dark border-clr_rose_border hover:bg-clr_rose_hover",
  eliminated:
    "bg-clr_rose_bg_light text-clr_rose_dark border-clr_rose_border hover:bg-clr_rose_hover",
  enrolled:
    "bg-clr_sky_bg text-clr_sky_dark border-clr_sky_border hover:bg-clr_sky_hover",
  active: "bg-green-100/70 text-green-800 border-green-300 hover:bg-green-100",
  not_attempted:
    "bg-clr_sky_bg text-clr_sky_dark border-clr_sky_border hover:bg-clr_sky_hover",
  present:
    "bg-clr_green_bg text-clr_green_dark border-clr_green_border hover:bg-clr_green_hover",
  leave:
    "bg-clr_amber_bg text-clr_amber_dark border-clr_amber_border hover:bg-clr_amber_hover",
  missing: "bg-blue-100 border-gray-300 hover:bg-blue-300 text-blue-800",
  available:
    "bg-green-100/70 text-green-800 border-green-300 hover:bg-green-100",
  issued:
    "bg-yellow-100/70 border border-yellow-300 text-yellow-800 hover:bg-yellow-100",
  inactive: "bg-red-100/70 text-red-800 border-red-300 hover:bg-red-100",
  default:
    "bg-clr_slate_bg text-clr_slate_dark border-clr_slate_border hover:bg-clr_slate_hover",
};

interface StatusBadgeProps {
  status?: StatusType;
  className?: string;
  children?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = "default",
  className = "",
  children,
}) => {
  const style = statusStyles[status];

  return (
    <Badge
      variant="outline"
      className={`font-medium border ${style} ${className}`}
    >
      {children ??
        status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
    </Badge>
  );
};

export default StatusBadge;
