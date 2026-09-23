import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useApiGetSingleUserQuery } from "@/src/redux/api";
import { useSelector } from "react-redux";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export const ViewUserDialog: React.FC<ViewUserDialogProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const [showPermissions, setShowPermissions] = useState(false);
  const { data, isLoading, isError } = useApiGetSingleUserQuery(userId!, {
    skip: !userId,
  });

  const userdata = data?.data?.user;

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("active");
  const [contact, setContact] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<string[]>([]);
  const [joining_Letter, setJoining_Letter] = useState<string[]>([]);
  const [leaving_Letter, setLeaving_Letter] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (userdata) {
      setName(userdata.name || "");
      setEmail(userdata.email || "");
      setCnic(userdata.cnic || "");
      setRole(userdata.role || "admin");
      setStatus(userdata.status || "active");
      setContact(userdata.contact_number || "");
      setDesignation(userdata.designation || "");
      setAddress(userdata.address || "");
      setAvatar(Array.isArray(userdata.avatar) ? userdata.avatar : []);
      setJoining_Letter(
        Array.isArray(userdata.joining_letter)
          ? [...userdata.joining_letter].reverse()
          : [],
      );
      setLeaving_Letter(
        Array.isArray(userdata.leaving_letter)
          ? [...userdata.leaving_letter].reverse()
          : [],
      );
      setPermissions(userdata.permissions || {});
    }
  }, [userdata]);

  const { user } = useSelector((state: any) => state.auth);

  const hasAccess = (perm?: string[]) => {
    return Array.isArray(perm) && perm.includes("READ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent className="max-w-130 h-[90vh] bg-white  [&>button]:hidden"> */}
      <DialogContent
        className="w-[95vw] sm:max-w-[600px]
      h-[90vh]
      bg-white
      [&>button]:hidden
      p-3 sm:p-6
      overflow-hidden
      rounded-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <DialogTitle>View User</DialogTitle>
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowPermissions(!showPermissions)}
              className="px-3 py-1 bg-[#047857] hover:bg-[#065f46] text-white text-sm rounded-md border border-gray-300 "
            >
              {showPermissions ? "Back to Details" : "Permissions"}
            </button>
          </div>
        </div>

        <form className="max-h-[80vh] overflow-y-auto  p-1  bg-white  rounded-md">
          {showPermissions ? (
            <div className="grid gap-4">
              {permissions && Object.keys(permissions).length > 0 ? (
                Object.entries(permissions).map(([module, capabilities]) => (
                  <div key={module} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      {module.replace("_", " ")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(capabilities) ? (
                        capabilities.map((cap: string) => (
                          <span
                            key={`${module}-${cap}`}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
                          >
                            {cap}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          No capabilities
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No permissions found</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Avatar */}
              <div className="grid gap-2">
                <Label>Profile Picture</Label>

                {avatar.filter(Boolean).length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto">
                    {avatar.filter(Boolean).map((url, idx) => (
                      <div
                        key={idx}
                        className="w-24 h-24 shrink-0 border rounded-md flex items-center justify-center"
                      >
                        <img
                          src={url}
                          alt={`Avatar ${idx + 1}`}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No file uploaded</p>
                )}
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    className="input border-none "
                    value={name
                     ?.split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Input
                    className="input border-none"
                    value={role
                      .split("_")
                      .map(
                        (word: any) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                    disabled
                  />
                </div>
              </div>

              {/* CNIC + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input className="input border-none" value={email} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>CNIC</Label>
                  <Input className="input border-none" value={cnic} disabled />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  className="input border-none"
                  value={address || "Address Not Set"}
                  disabled
                />
              </div>

              {/* Contact Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Contact Number</Label>
                  <Input
                    className="input border-none"
                    value={contact || "Contact Number Not Set"}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Designation</Label>
                  <Input
                    className="input border-none"
                    value={
                      designation
                        ? designation
                            .split(" ")
                            .filter(Boolean)
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(" ")
                        : "Designation Not Set"
                    }
                    disabled
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} disabled>
                  <SelectTrigger className="input shadow-none border-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4">
                {/* Joining Letter */}
                <div>
                  <Label>Joining Letter</Label>
                  {joining_Letter.filter(Boolean).length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {joining_Letter.filter(Boolean)[0] && (
                        <img
                          key={joining_Letter.filter(Boolean)[0]}
                          src={joining_Letter.filter(Boolean)[0]}
                          alt="Joining Letter 1"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded</p>
                  )}
                </div>

                {/* Leaving Letter */}
                <div>
                  <Label>Leaving Letter</Label>
                  {leaving_Letter.filter(Boolean).length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {leaving_Letter.filter(Boolean)[0] && (
                        <img
                          src={leaving_Letter.filter(Boolean)[0]}
                          alt="Leaving Letter 1"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
