import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import {
  useApiEditUserMutation,
  useLazyApiGetSignedUrlQuery,
} from "@/src/redux/api";
import { uploadImagesToCloudinary } from "@/src/utils/UploadImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FormControl,
  FormField,
  Form,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Camera } from "lucide-react";

const EditProfileModal = ({ open, onOpenChange, userdata, refetchUser }: any) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [updateUser, { isLoading }] = useApiEditUserMutation();
  const [getSignedUrl] = useLazyApiGetSignedUrlQuery();

  const { register, handleSubmit, reset, control } = useForm();

  //  existing avatar handle (array or string)
  const avatarUrl = Array.isArray(userdata?.avatar)
    ? userdata.avatar[0]
    : userdata?.avatar;

  useEffect(() => {
    if (userdata) {
      reset({
        name: userdata.name || "",
        email: userdata.email || "",
        cnic: userdata.cnic || "",
        contact_number: userdata.contact_number || "",
        address: userdata.address || "",
        status: userdata?.status || "",
        designation: userdata.designation || "",
      });
    }
  }, [userdata, reset]);

  //  get signed url
  const getSignedUrlForUpload = async (count: number) => {
    const res = await getSignedUrl({
      folder: "userDocuments",
      count,
    }).unwrap();
    return res;
  };

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      cnic: "",
      contact_number: "",
      address: "",
      status: "active",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      let avatar;

      //  upload avatar if new selected
      if (avatarFile) {
        const signedData = await getSignedUrlForUpload(1);

        const urls = await uploadImagesToCloudinary(
          [avatarFile],
          async () => signedData,
        );

        avatar = urls?.[0];
      }
 
      await updateUser({
        id: userdata._id,
        data: {
          name: data.name,
          email: data.email,
          cnic: data.cnic,
          contact_number: data.contact_number,
          address: data.address,
          status: data.status,
          ...(avatar && { avatar }),
        },
      }).unwrap();
      await refetchUser(); 

      onOpenChange(false);
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-xl">
        <DialogTitle>Edit Profile</DialogTitle>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/*  Avatar */}
            <div className="flex flex-col items-center gap-2">
              {/* Avatar Wrapper */}
              <div className="relative w-24 h-24">
                {/* Avatar / Initials */}
                {preview || avatarUrl ? (
                  <img
                    src={preview || avatarUrl}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-gray-200 text-gray-700 text-lg font-semibold uppercase">
                    {userdata?.name
                      ?.split(" ")
                      .map((word: string) => word.charAt(0))
                      .join("")}
                  </div>
                )}
                <Button
                  type="button"
                  title="Change photo"
                  size="icon"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  className="absolute bottom-0 right-0 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition"
                  aria-label="Change profile image"
                >
                  <Camera size={14} />
                </Button>
              </div>

              {/* Hidden Input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />

              {/* Hidden File Input */}
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/*  Fields */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">Name</label>
                <Input
                  className=" shadow-none"
                  {...register("name")}
                  placeholder="Enter name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">Email</label>
                <Input
                  className=" shadow-none"
                  {...register("email")}
                  placeholder="Enter email"
                />
              </div>

              {/* CNIC */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">CNIC</label>
                <Input
                  className=" shadow-none"
                  {...register("cnic")}
                  placeholder="Enter CNIC"
                />
              </div>
              <div className="flex flex-col gap-1 ">
                <label className="text-sm font-medium text-black">
                  Address
                </label>
                <Input
                  className=" shadow-none"
                  {...register("address")}
                  placeholder="Enter address"
                />
              </div>

              {/* Contact Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">
                  Contact Number
                </label>
                <Input
                  className=" shadow-none"
                  {...register("contact_number")}
                  placeholder="Enter contact number"
                />
              </div>

              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border shadow-none border-gray-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="bg-white shadow-none ">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/*  Submit */}
            <Button
              type="submit"
              className="bg-[#047857] hover:bg-[#047857] text-white w-full"
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
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
