import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useApiGetRolesQuery } from "@/src/redux/api";

interface FilterUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: [];
  allUsers: any[];
  onApply: (filters: { role: string; status: string }) => void;
}
export const FilterUser: React.FC<FilterUserProps> = ({
  open,
  onOpenChange,
  users,
  allUsers,
  onApply,
}) => {
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: rolesData } = useApiGetRolesQuery({});
  const userole = rolesData?.data || [];

  const statuses = [
    "all",
    ...new Set(allUsers.map((u: any) => u.status).filter(Boolean)),
  ];

  const handleReset = () => {
    setRole("all");
    setStatus("all");
  };

  const handleApply = () => {
    onApply({ role, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-[400px] max-h-[90vh] overflow-y-auto bg-white rounded-xl">
        <div className="grid gap-4 py-4">
          {/* Role */}
          <div className="grid gap-2">
            <Label>Roles</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="border border-gray-300 shadow-none">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent className="bg-white shadow-none">
                <SelectItem value="all">All Roles</SelectItem>
                {Array.isArray(userole) &&
                  userole?.map((r: string) => (
                    <SelectItem key={r} value={r}>
                      {r
                        .replace(/_/g, " ")
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border border-gray-300 shadow-none">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none">
                {statuses?.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all"
                      ? "All Status"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            className="w-full sm:w-auto shadow-none border border-gray-200"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            onClick={handleApply}
            className="w-full sm:w-auto bg-[#047857] shadow-none hover:bg-[#047857] text-white"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
