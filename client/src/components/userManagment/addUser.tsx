import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useApiAddUserMutation,
  useApiGetPermissionsQuery,
  useLazyApiGetSignedUrlQuery,
} from "@/src/redux/api";
import { uploadImagesToCloudinary } from "@/src/utils/UploadImage";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { showToast } from "@/src/utils/toast";
import { Pencil } from "lucide-react";
import { useSelector } from "react-redux";

const MAX_FILE_SIZE = 10485760; // 10MB

export const userSchema = z
  .object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    cnic: z.string().min(13, "CNIC must be 13 digits"),
    contact: z.string().min(10, "Invalid contact number"),
    address: z.string().min(5, "Address is required"),
    role: z.string(),
    designation: z
      .string()
      .min(3, "Designation must be at least 3 characters long")
      .nonempty("Designation is required"),
    avatar: z
      .instanceof(File)
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        "File size must be less than 10MB",
      )
      .nullable()
      .optional(),
    joining_letter: z
      .array(z.instanceof(File))
      .refine(
        (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
        "File size must be less than 10MB",
      )
      .optional(),
    leaving_letter: z
      .array(z.instanceof(File))
      .refine(
        (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
        "File size must be less than 10MB",
      )
      .optional(),
    status: z.enum(["active", "inactive"]),
    permissions: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userdata?: any;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  userdata,
}) => {
  const [addUser, { isLoading }] = useApiAddUserMutation();
  const [getSignedUrl] = useLazyApiGetSignedUrlQuery();
  const [showPermissions, setShowPermissions] = React.useState(false);
  const [customPermissions, setCustomPermissions] = React.useState<any>(null);
  const { user } = useSelector((state: any) => state.auth);

  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [joiningLetterFiles, setJoiningLetterFiles] = useState<File[]>([]);
  const [leavingLetterFiles, setLeavingLetterFiles] = useState<File[]>([]);
  const [onSubmitIsloading, setOnSubmitIsloading] = useState(false);

  const { data: permissionsData, isLoading: isPermissionsLoading } =
    useApiGetPermissionsQuery();

  const currentUserRole = user?.role;

  const roleOptions = [
    { label: "Super Admin", value: "super_admin" },
    { label: "Admin", value: "admin" },
    { label: "Record Keeper", value: "record_keeper" },
    { label: "Viewer", value: "viewer" },
  ];

  const filteredRoles =
    currentUserRole === "super_admin"
      ? roleOptions // sab allowed
      : roleOptions.filter((role) =>
          ["viewer", "record_keeper"].includes(role.value),
        );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      cnic: "",
      contact: "",
      address: "",
      designation: "",
      role: "admin",
      avatar: null,
      leaving_letter: [],
      joining_letter: [],
      status: "active",
      permissions: {},
    },
  });

  const selectedRole = form.watch("role");

  // Initialize permissions when role changes
  useEffect(() => {
    if (selectedRole && permissionsData?.data?.USER_ROLES) {
      const roleKey = selectedRole.toUpperCase();
      const defaultPermissions =
        permissionsData.data.USER_ROLES[roleKey]?.permissions;
      if (defaultPermissions) {
        setCustomPermissions(JSON.parse(JSON.stringify(defaultPermissions)));
      }
    }
  }, [selectedRole, permissionsData]);

  const handleFileUpload = (
    files: File[],
    type: "avatar" | "joining" | "leaving",
  ) => {
    if (type === "avatar") setAvatarFiles(files);
    else if (type === "joining") setJoiningLetterFiles(files);
    else if (type === "leaving") setLeavingLetterFiles(files);
  };

  const getSignedUrlForUpload = async (fileCount: number) => {
    try {
      const response = await getSignedUrl({
        folder: "userDocuments",
        count: fileCount,
      }).unwrap();
      return response;
    } catch (error) {
      console.error("Failed to get signed URL:", error);
      throw error;
    }
  };

  const uploadFiles = async (
    files: File[],
    type: "avatar" | "joining" | "leaving",
  ) => {
    if (files.length === 0) return [];

    const signedData = await getSignedUrlForUpload(files.length);
    const urls = await uploadImagesToCloudinary(
      files,
      async (count) => signedData,
    );

    return urls;
  };

  // Prefill form if userdata exists (for editing)
  useEffect(() => {
    if (userdata) {
      form.reset({
        name: userdata.name || "",
        email: userdata.email || "",
        cnic: userdata.cnic || "",
        contact: userdata.contact_number || "",
        address: userdata.address || "",
        avatar: userdata.avatar ?? "", // single image
        joining_letter: userdata.joining_letter ?? [], // must be array
        leaving_letter: userdata.leaving_letter ?? [],
        role: userdata.role || "admin",
        status: userdata.status || "active",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userdata, form]);

  const onSubmit = async (data: UserFormValues) => {
    setOnSubmitIsloading(true);
    try {
      const avatarFileList = data.avatar
        ? [data.avatar]
        : avatarFiles.length > 0
          ? avatarFiles
          : [];

      const uploadedAvatar =
        avatarFileList.length > 0
          ? (await uploadFiles(avatarFileList, "avatar"))[0]
          : null;
      const uploadedJoining =
        joiningLetterFiles.length > 0
          ? await uploadFiles(joiningLetterFiles, "joining")
          : [];
      const uploadedLeaving =
        leavingLetterFiles.length > 0
          ? await uploadFiles(leavingLetterFiles, "leaving")
          : [];

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        contact_number: data.contact,
        address: data.address,
        cnic: data.cnic,
        role: data.role,
        designation: data.designation,
        status: data.status,
        permissions: customPermissions || {},
        avatar: uploadedAvatar || null,
        joining_letter: uploadedJoining,
        leaving_letter: uploadedLeaving,
      };

      const response = await addUser(payload).unwrap();

      showToast(response.message, "success");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to add user", err);

      // Type guard for RTK Query error
      const error = err as { status: number; data?: { message?: string } };

      if (error?.data?.message) {
        // Show backend error message
        showToast(error.data.message, "error");
      } else if ((error as any)?.error) {
        // Network or fetch error
        showToast((error as any).error, "error");
      } else {
        showToast("Something went wrong!", "error");
      }
    }
  };

  const getRolePermissions = () => {
    if (!permissionsData?.data?.USER_ROLES || !selectedRole) return null;
    const roleKey = selectedRole.toUpperCase();
    return permissionsData.data.USER_ROLES[roleKey]?.permissions;
  };

  const permissionsToShow = customPermissions || getRolePermissions();

  const togglePermission = (module: string, capability: string) => {
    if (!customPermissions) return;

    setCustomPermissions((prev: any) => {
      const updated = { ...prev };
      if (!updated[module]) {
        updated[module] = [];
      }

      if (updated[module].includes(capability)) {
        // Remove capability
        updated[module] = updated[module].filter(
          (c: string) => c !== capability,
        );
      } else {
        // Add capability
        updated[module] = [...updated[module], capability];
      }

      return updated;
    });
  };

  const hasPermission = (module: string, capability: string) => {
    return customPermissions?.[module]?.includes(capability) || false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 h-[90vh] bg-white [&>button]:hidden">
        <div className="flex  items-center justify-between">
          <DialogTitle>Add User</DialogTitle>
          <div className="flex  items-start justify-between gap-4">
            <Button
              type="button"
              className="bg-[#047857] hover:bg-[#065f46] text-white"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              {showPermissions ? "Back to Form" : "Permission"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form
            className="flex-1 overflow-y-auto"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {showPermissions ? (
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">
                  Role Permissions:{" "}
                  {selectedRole
                    ? selectedRole.replace("_", " ").toUpperCase()
                    : "No Role Selected"}
                </h3>
                {!selectedRole ? (
                  <p className="text-gray-500">Please select a role first</p>
                ) : (
                  <div className="space-y-4">
                    {permissionsToShow ? (
                      Object.entries(permissionsToShow).map(
                        ([module, capabilities]) => (
                          <div key={module} className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-3">
                              {module.replace("_", " ")}
                            </h4>

                            <p className="text-xs text-gray-500 mb-2">
                              Click to toggle capabilities:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "READ",
                                "WRITE",
                                "UPDATE",
                                "DELETE",
                                ...(module === "FILE" ? ["EXPORT"] : []),
                              ].map((cap) => {
                                const isActive = hasPermission(module, cap);

                                return (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      togglePermission(module, cap)
                                    }
                                    key={cap}
                                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                      isActive
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    }`}
                                  >
                                    {cap}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-gray-500">
                        No permissions found for this role
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ===== FORM FIELDS ===== */
              <div className="grid gap-4 py-2">
                <div className="flex items-center gap-4 ">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center gap-2">
                            {/* Preview */}
                            <div className="w-20 h-20 relative">
                              {field.value ? (
                                <img
                                  src={URL.createObjectURL(field.value)}
                                  alt="Avatar Preview"
                                  className={`w-full h-full rounded-md object-cover border ${fieldState.error ? 'border-destructive' : 'border-gray-300'}`}
                                />
                              ) : (
                                <div className={`w-full h-full rounded-md border flex items-center justify-center text-gray-400 ${fieldState.error ? 'border-destructive' : 'border-gray-300'}`}>
                                  No Image
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  document
                                    .getElementById("avatar-upload")
                                    ?.click()
                                }
                                className="absolute -top-1 -right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                aria-label="Change profile image"
                              >
                                <Pencil size={14} />
                              </button>
                              {field.value && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(null);
                                    setAvatarFiles([]);
                                  }}
                                  className="absolute -top-1 -left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700 transition-colors"
                                  aria-label="Remove profile image"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            {/* File Input */}
                            <input
                              type="file"
                              accept="image/*"
                              id="avatar-upload"
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                field.onChange(files[0] || null);
                                handleFileUpload(files, "avatar");
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel className="text-xs">Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 border shadow-none border-gray-300">
                              <SelectValue
                                className="shadow-none"
                                placeholder="Select role"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {filteredRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNIC</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            maxLength={13}
                            className="border shadow-none border-gray-300"
                            {...field}
                            onInput={(e) => {
                              e.currentTarget.value =
                                e.currentTarget.value.replace(/\D/g, "");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          className="border shadow-none border-gray-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input
                            className="border shadow-none border-gray-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border shadow-none border-gray-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joining_letter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Letter</FormLabel>
                      <FormControl>
                        <div className="flex items-start flex-col gap-2">
                          {/* Preview */}
                          {Array.isArray(field.value) && field.value[0] && (
                            <div className="relative w-full">
                              <img
                                src={URL.createObjectURL(field.value[0])}
                                alt="Joining Letter"
                                className="w-full h-32 object-contain rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange([]);
                                  setJoiningLetterFiles([]);
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
                                aria-label="Remove joining letter"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          {/* File Input */}
                          <input
                            type="file"
                            accept="image/*"
                            id="joining-letter-upload"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              field.onChange(files);
                              handleFileUpload(files, "joining");
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("joining-letter-upload")
                                ?.click()
                            }
                          >
                            <Pencil size={14} className="mr-1" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leaving_letter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leaving Letter</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-start gap-2">
                          {/* Preview */}
                          {Array.isArray(field.value) && field.value[0] && (
                            <div className="relative w-full">
                              <img
                                src={URL.createObjectURL(field.value[0])}
                                alt="Leaving Letter"
                                className="w-full h-32 object-contain rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange([]);
                                  setLeavingLetterFiles([]);
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
                                aria-label="Remove leaving letter"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          {/* File Input */}
                          <input
                            type="file"
                            accept="image/*"
                            id="leaving-letter-upload"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              field.onChange(files);
                              handleFileUpload(files, "leaving");
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("leaving-letter-upload")
                                ?.click()
                            }
                          >
                            <Pencil size={14} className="mr-1" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ===== FOOTER ===== */}
            <DialogFooter className="pt-3 mb-2 md:gap-0  gap-2">
              <Button
                type="button"
                variant="outline"
                className="border shadow-none border-gray-300"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                className={`
    bg-[#047857] w-full text-white
    transition-all duration-200
    hover:bg-teal-700
    active:scale-95
    disabled:opacity-70 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `}
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isLoading ? "Saving..." : "Save"}
                {/* {isLoading&& (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                 "Saving..." : "Save")} */}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
