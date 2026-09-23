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
  useApiEditUserMutation,
  useApiGetSingleUserQuery,
  useApiGetPermissionsQuery,
  useLazyApiGetSignedUrlQuery,
} from "@/src/redux/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { showToast } from "@/src/utils/toast";
import { uploadImagesToCloudinary } from "@/src/utils/UploadImage";
import { Camera, Pencil } from "lucide-react";

const MAX_FILE_SIZE = 10485760; // 10MB

const fileSchema = z
  .any()
  .refine((file) => {
    if (!file) return true;
    if (file instanceof File) {
      return file.size <= MAX_FILE_SIZE;
    }
    return true;
  }, "File size must be less than 10MB")
  .optional();

const editUserSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  cnic: z
    .string()
    .min(13, "CNIC must be 13 digits")
    .max(13, "CNIC must be 13 digits"),
  contact_number: z
    .string()
    .min(10, "Invalid contact number")
    .max(11, "Invalid contact number"),
  address: z.string().min(5, "Address is required"),
  role: z.string(),
  avatar: fileSchema,
  designation: z.string(),
  status: z.enum(["active", "inactive"]),
  joining_letter: fileSchema,
  leaving_letter: fileSchema,
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface ViewEditUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: any;
}

export const EditUser: React.FC<ViewEditUserProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const [showPermissions, setShowPermissions] = React.useState(false);
  const [onSubmitIsloading, setOnSubmitIsloading] = React.useState(false);

  const [customPermissions, setCustomPermissions] = React.useState<any>(null);

  const { data, isLoading: isFetching } = useApiGetSingleUserQuery(userId, {
    skip: !userId || !open,
  });

  const userdata = data?.data?.user;

  const { data: permissionsData } = useApiGetPermissionsQuery();
  const [joiningLetterFiles, setJoiningLetterFiles] = React.useState<File[]>(
    [],
  );
  const [leavingLetterFiles, setLeavingLetterFiles] = React.useState<File[]>(
    [],
  );
  const [avatarFiles, setAvatarFiles] = React.useState<File[]>([]);
  const [signedData, setSignedData] = React.useState<any>(null);
  const [getSignedUrl] = useLazyApiGetSignedUrlQuery();

  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);
  const [existingJoiningLetters, setExistingJoiningLetters] = useState<
    string[]
  >([]);
  const [existingLeavingLetters, setExistingLeavingLetters] = useState<
    string[]
  >([]);

  const [updateUser, { isLoading }] = useApiEditUserMutation();

  const form = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cnic: "",
      contact_number: "",
      address: "",
      role: "admin",
      designation: "",
      status: "active",
      avatar: undefined,
      joining_letter: undefined,
      leaving_letter: undefined,
    },
  });

  const selectedRole = form.watch("role");

  // Initialize/update permissions when role changes
  useEffect(() => {
    if (!selectedRole || !permissionsData?.data?.USER_ROLES) return;

    const roleKey = selectedRole.toUpperCase();
    const defaultPermissions =
      permissionsData.data.USER_ROLES[roleKey]?.permissions;

    if (userdata?.role && selectedRole === userdata.role) {
      if (userdata.permissions) {
        setCustomPermissions(JSON.parse(JSON.stringify(userdata.permissions)));
      } else if (defaultPermissions) {
        setCustomPermissions(JSON.parse(JSON.stringify(defaultPermissions)));
      }
      return;
    }

    if (defaultPermissions) {
      setCustomPermissions(JSON.parse(JSON.stringify(defaultPermissions)));
    }
  }, [selectedRole, permissionsData, userdata]);

  useEffect(() => {
    if (userdata) {
      form.reset({
        name: userdata.name || "",
        email: userdata.email || "",
        cnic: userdata.cnic ? String(userdata.cnic) : "",
        contact_number: userdata.contact_number
          ? String(userdata.contact_number)
          : "",
        address: userdata.address || "",
        role: userdata.role || "admin",
        designation: userdata.designation || "",
        status: userdata.status || "active",
        password: "",
        avatar: undefined,
        joining_letter: undefined,
        leaving_letter: undefined,
      });
      setExistingAvatar(userdata.avatar || null);
      setExistingJoiningLetters(userdata.joining_letter || []);
      setExistingLeavingLetters(userdata.leaving_letter || []);

      // Set user's existing permissions
      if (userdata.permissions) {
        setCustomPermissions(JSON.parse(JSON.stringify(userdata.permissions)));
      }
    }
  }, [userdata, form]);

  const getSignedUrlForUpload = async (fileCount: number) => {
    try {
      const response = await getSignedUrl({
        folder: "userDocuments",
        count: fileCount,
      }).unwrap();
      setSignedData(response);
      return response;
    } catch (error) {
      console.error("Failed to get signed URL:", error);
      throw error;
    }
  };

  const onSubmit = async (data: any) => {
    if (!userdata?._id) {
      console.error("Cannot update user: userId not loaded yet");
      return;
    }
    setOnSubmitIsloading(true);

    let uploadedAvatarUrl, joiningUrls, leavingUrls;
    try {
      // Upload avatar if selected
      if (avatarFiles.length > 0) {
        const avatarSignedData = await getSignedUrlForUpload(
          avatarFiles.length,
        );
        const avatarUrls = await uploadImagesToCloudinary(
          avatarFiles,
          async (count: number) => avatarSignedData,
        );
        uploadedAvatarUrl = avatarUrls?.[0];
      }

      // Upload joining letter if selected
      if (joiningLetterFiles.length > 0) {
        const joiningSignedData = await getSignedUrlForUpload(
          joiningLetterFiles.length,
        );
        joiningUrls = await uploadImagesToCloudinary(
          joiningLetterFiles,
          async (count: number) => joiningSignedData,
        );
      }

      // Upload leaving letter if selected
      if (leavingLetterFiles.length > 0) {
        const leavingSignedData = await getSignedUrlForUpload(
          leavingLetterFiles.length,
        );
        leavingUrls = await uploadImagesToCloudinary(
          leavingLetterFiles,
          async (count: number) => leavingSignedData,
        );
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setOnSubmitIsloading(false);

      showToast("Failed to upload files", "error");
      return;
    }
    try {
      const response = await updateUser({
        id: userdata._id,
        data: {
          name: data.name,
          email: data.email,
          contact_number: data.contact_number,
          address: data.address,
          cnic: data.cnic,
          role: data.role,
          designation: data.designation,
          status: data.status,
          ...(data.password && { password: data.password }),
          ...(customPermissions && { permissions: customPermissions }),
          ...(uploadedAvatarUrl && { avatar: uploadedAvatarUrl }),
          ...(joiningUrls &&
            joiningUrls.length > 0 && { joining_letter: joiningUrls }),
          ...(leavingUrls &&
            leavingUrls.length > 0 && { leaving_letter: leavingUrls }),
        },
      }).unwrap();

      showToast(response.message || "User updated successfully", "success");
      onOpenChange(false);
      setOnSubmitIsloading(false);
    } catch (err) {
      setOnSubmitIsloading(false);
      console.error("Failed to update user:", err);
      const error = err as { status: number; data?: { message?: string } };

      if (error?.data?.message) {
        showToast(error.data.message, "error");
      } else {
        showToast("Failed to update user", "error");
      }
    }
  };

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

  const handleFileUpload = (
    files: File[],
    type: "avatar" | "joining" | "leaving",
  ) => {
    if (type === "avatar") {
      setAvatarFiles(files);
    } else if (type === "joining") {
      setJoiningLetterFiles(files);
    } else if (type === "leaving") {
      setLeavingLetterFiles(files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 h-[90vh] bg-white [&>button]:hidden">
        <div className="flex items-center justify-between">
          <DialogTitle>Edit User</DialogTitle>
          <Button
            type="button"
            onClick={() => setShowPermissions(!showPermissions)}
            className="bg-[#047857] hover:bg-[#065f46] text-white"
          >
            {showPermissions ? "Back to Form" : "Permissions"}
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-2 space-y-3"
          >
            {/* ===== PERMISSIONS VIEW ===== */}
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
                    {customPermissions ? (
                      Object.entries(customPermissions).map(
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
                <div className="flex flex-col items-start gap-3">
                  {/* Avatar */}
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="relative w-20 h-10">
                    <img
                      src={
                        avatarFiles.length > 0
                          ? URL.createObjectURL(avatarFiles[0])
                          : existingAvatar || "/assets/auth/sbcaLogo.png"
                      }
                      alt="Profile"
                      loading="lazy"
                      className="w-full h-full rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                      className="absolute -top-1 -right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Change profile image"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  {/* Upload Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileUpload(files, "avatar");
                      form.setValue("avatar", files[0], { shouldValidate: true });
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  {form.formState.errors.avatar && (
                    <p className="text-[0.8rem] font-medium text-destructive mt-1">
                      {form.formState.errors.avatar.message as string}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                            <SelectTrigger className="h-9 shadow-none border border-gray-300">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white shadow-none">
                            <SelectItem value="super_admin">
                              Super Admin
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="record_keeper">
                              Record Keeper
                            </SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="border shadow-none border-gray-300"
                          placeholder="Leave blank to keep current"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            maxLength={15}
                            className="border shadow-none border-gray-300"
                            {...field}
                            value={field.value || ""}
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
                          <SelectTrigger className="border shadow-none  border-gray-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white shadow-none  ">
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
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Joining Letter</FormLabel>

                      <FormControl>
                        <div className={`border rounded-md p-1 ${fieldState.error ? 'border-destructive' : 'border-gray-300'}`}>
                          {/* Existing file (Edit mode) */}
                          {existingJoiningLetters.length > 0 &&
                            joiningLetterFiles.length === 0 && (
                              <>
                                <a
                                  href={existingJoiningLetters[0]}
                                  target="_blank"
                                  className="text-sm text-blue-600 underline block"
                                >
                                  View existing joining letter
                                </a>
                                <div className="relative mt-2">
                                  <img
                                    src={existingJoiningLetters[0]}
                                    alt="Existing Joining Letter"
                                    className="w-full h-32 object-contain rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      document
                                        .getElementById("joining-letter-input")
                                        ?.click()
                                    }
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                </div>
                              </>
                            )}

                          {/* New upload */}
                          <input
                            id="joining-letter-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleFileUpload(files, "joining");
                              field.onChange(files[0]);
                            }}
                            className="w-full text-sm cursor-pointer"
                          />

                          {/* New file selected */}
                          {joiningLetterFiles.length > 0 && (
                            <>
                              <p className="text-xs text-green-600">
                                {joiningLetterFiles[0].name} selected
                              </p>
                              <div className="relative mt-2">
                                <img
                                  src={URL.createObjectURL(
                                    joiningLetterFiles[0],
                                  )}
                                  alt="New Joining Letter"
                                  className="w-full h-32 object-contain rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    document
                                      .getElementById("joining-letter-input")
                                      ?.click()
                                  }
                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                                >
                                  <Pencil size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leaving_letter"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Leaving Letter</FormLabel>

                      <FormControl>
                        <div className={`border rounded-md p-1 ${fieldState.error ? 'border-destructive' : 'border-gray-300'}`}>
                          {/* Existing file (Edit mode) */}
                          {existingLeavingLetters.length > 0 &&
                            leavingLetterFiles.length === 0 && (
                              <>
                                <a
                                  href={existingLeavingLetters[0]}
                                  target="_blank"
                                  className="text-sm text-blue-600 underline block"
                                >
                                  View existing Leaving letter
                                </a>
                                <div className="relative mt-2">
                                  <img
                                    src={existingLeavingLetters[0]}
                                    alt="Existing Leaving Letter"
                                    className="w-full h-32 object-contain rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      document
                                        .getElementById("leaving-letter-input")
                                        ?.click()
                                    }
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                </div>
                              </>
                            )}

                          {/* New upload */}
                          <input
                            id="leaving-letter-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleFileUpload(files, "leaving");
                              field.onChange(files[0]);
                            }}
                            className="w-full text-sm cursor-pointer"
                          />

                          {/* New file selected */}
                          {leavingLetterFiles.length > 0 && (
                            <>
                              <p className="text-xs text-green-600">
                                {leavingLetterFiles[0].name} selected
                              </p>
                              <div className="relative mt-2">
                                <img
                                  src={URL.createObjectURL(
                                    leavingLetterFiles[0],
                                  )}
                                  alt="New Leaving Letter"
                                  className="w-full h-32 object-contain rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    document
                                      .getElementById("leaving-letter-input")
                                      ?.click()
                                  }
                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                                >
                                  <Pencil size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ===== FOOTER ===== */}
            <div className="flex justify-center gap-2">
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
                disabled={onSubmitIsloading}
                className={`
    bg-[#047857] w-full text-white
    transition-all duration-200
    hover:bg-teal-700
    active:scale-95
    disabled:opacity-70 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `}
              >
                {onSubmitIsloading && (
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

                {onSubmitIsloading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
