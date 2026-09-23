import React, { useEffect, useState } from "react";
import { useApiGetMeQuery } from "@/src/redux/api";
import { BreadcrumbNav } from "./shared/BreadCrumb";
import { Button } from "./ui/button";
import EditProfileModal from "./dashboard/EditProfileModal";

function ViewProfile() {
  const [openEdit, setOpenEdit] = useState(false);

  const [imgError, setImgError] = useState(false);

  const { data, error, isLoading, refetch } = useApiGetMeQuery({
    refetchOnMountOrArgChange: true,
  });
  const userdata = data?.data?.user || {};

  const avatarUrl = Array.isArray(userdata?.avatar)
    ? userdata.avatar[0]
    : userdata?.avatar;

  const isValidAvatar =
    typeof avatarUrl === "string" && avatarUrl.trim() !== "";

  const isSuperAdmin = userdata?.role === "super_admin";

  if (isLoading) return <div>Loading</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <div className="h-full p-2 flex flex-col items-start justify-start   overflow-x-hidden ">
        <div className="px-9  lg:px-0">
          <BreadcrumbNav items={[{ title: "View Profile" }]} />
        </div>
        <div className="w-full max-w-7xl  py-3 my-3   ">
          {/* Image + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:mb-4 w-full">
            {/* LEFT SIDE: Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 min-w-0">
              {isValidAvatar && !imgError ? (
                <img
                  src={userdata.avatar}
                  alt="User Avatar"
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-gray-200"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center text-xl font-semibold text-gray-700 bg-gray-200 rounded-full">
                  {userdata?.name
                    ?.split(" ")
                    .map((word: any) => word[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>

            {/* RIGHT SIDE: Edit Button */}
            {isSuperAdmin && (
              <div className="flex justify-end w-full sm:w-auto">
                <Button
                  onClick={() => setOpenEdit(true)}
                  className="bg-[#047857] hover:bg-[#047857]  text-white flex items-center gap-2 px-4"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Form */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  ">
            {/* Full Name */}
            <div className="flex flex-col  gap-1 min-w-0">
              <label className="text-sm font-medium text-black">Name</label>
              <input
                name="name"
                disabled
                value={userdata?.name
                  ?.split(" ")
                  .map(
                    (word: any) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(" ")}
                className="input w-full min-w-0"
                placeholder="Enter full name"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-black">Email</label>
              <input
                disabled
                name="email"
                value={userdata.email}
                className="input w-full min-w-0"
                placeholder="Email"
              />
            </div>

            {/* CNIC */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-black">CNIC</label>
              <input
                disabled
                name="cnic"
                value={userdata.cnic}
                className="input    min-w-0"
                placeholder="Enter CNIC"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-black">Address</label>
              <input
                disabled
                name="address"
                value={userdata.address}
                className="input w-full min-w-0 "
                placeholder="Enter address"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-black">
                Contact Number
              </label>
              <input
                disabled
                name="phone"
                value={userdata.contact_number}
                className="input w-full min-w-0"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}

            {/* Status */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium text-black">Status</label>
              <input
                disabled
                name="status"
                value={userdata.status}
                className="input w-full min-w-0 "
                placeholder="Status"
              />
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal
       refetchUser={refetch}
        open={openEdit}
        onOpenChange={setOpenEdit}
        userdata={userdata}
      />
    </div>
  );
}

export default ViewProfile;
