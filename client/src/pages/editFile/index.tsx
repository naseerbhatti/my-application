import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { file, z } from "zod";
import { showToast } from "@/src/utils/toast";

import {
  useApiGetAllHousesQuery,
  useApiGetAllRacksQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllShelvesQuery,
  useApiGetFileByIdQuery,
  useApiUpdateFileMutation,
} from "@/src/redux/api";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import { Feild } from "@/src/components/shared/Field";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card } from "@/src/components/ui/card";

// Zod validation schema
const editFileSchema = z.object({
  houseId: z.string().min(1, "Please select a house"),
  roomId: z.string().min(1, "Please select a room"),
  rackId: z.string().min(1, "Please select a rack"),
  shelfId: z.string().min(1, "Please select a shelf"),
  status: z.string().optional(),
});

type EditFileFormData = z.infer<typeof editFileSchema>;

export const EditFile = () => {
  const { id } = useParams<{ id: string }>();
  const isInitializing = useRef(true);

  const { data: fileData } = useApiGetFileByIdQuery(id || "", {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  // Store initial IDs from file data for queries
  const [initialHouseId, setInitialHouseId] = useState<string>("");
  const [initialRoomId, setInitialRoomId] = useState<string>("");
  const [initialRackId, setInitialRackId] = useState<string>("");

  // Store initial location objects to display names
  const [initialHouse, setInitialHouse] = useState<any>(null);
  const [initialRoom, setInitialRoom] = useState<any>(null);
  const [initialRack, setInitialRack] = useState<any>(null);
  const [initialShelf, setInitialShelf] = useState<any>(null);
  // const [initialStatus, setInitialStatus] = useState<any>(null);

  const [updateFile, { isLoading: isUpdating }] = useApiUpdateFileMutation();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditFileFormData>({
    resolver: zodResolver(editFileSchema),
    defaultValues: {
      houseId: "",
      roomId: "",
      rackId: "",
      shelfId: "",
      status: "",
    },
  });
  const navigate = useNavigate();

  // Watch form fields for cascading dropdowns
  const selectedHouseId = watch("houseId");
  const selectedRoomId = watch("roomId");
  const selectedRackId = watch("rackId");

  // Fetch all houses
  const { data: housesData } = useApiGetAllHousesQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  // Fetch rooms filtered by house (use selectedHouseId or initialHouseId)
  const { data: roomsData } = useApiGetAllRoomsQuery(
    {
      page: 1,
      limit: 100,
      house_id: selectedHouseId || initialHouseId || undefined,
    },
    {
      skip: !selectedHouseId && !initialHouseId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Fetch racks filtered by room (use selectedRoomId or initialRoomId)
  const { data: racksData } = useApiGetAllRacksQuery(
    {
      page: 1,
      limit: 100,
      room_id: selectedRoomId || initialRoomId || undefined,
    },
    {
      skip: !selectedRoomId && !initialRoomId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Fetch shelves filtered by rack (use selectedRackId or initialRackId)
  const { data: shelvesData } = useApiGetAllShelvesQuery(
    {
      page: 1,
      limit: 100,
      rack_id: selectedRackId || initialRackId || undefined,
    },
    {
      skip: !selectedRackId && !initialRackId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Set initial IDs to trigger dependent queries
  useEffect(() => {
    if (fileData?.data?.shelf && isInitializing.current) {
      const house = fileData.data.shelf.rack.room.house;
      const room = fileData.data.shelf.rack.room;
      const rack = fileData.data.shelf.rack;
      const shelf = fileData.data.shelf;

      setInitialHouseId(house?._id || "");
      setInitialRoomId(room._id || "");
      setInitialRackId(rack._id || "");

      setInitialHouse(house);
      setInitialRoom(room);
      setInitialRack(rack);
      setInitialShelf(shelf);
      // setInitialStatus(status);
    }
  }, [fileData]);

  // Initialize form values after dependent data is loaded
  useEffect(() => {
    if (
      fileData?.data?.shelf &&
      housesData &&
      roomsData &&
      racksData &&
      shelvesData &&
      isInitializing.current
    ) {
      const initialValues = {
        houseId: fileData.data.shelf.rack.room.house?._id || "",
        roomId: fileData.data.shelf.rack.room?._id || "",
        rackId: fileData.data.shelf.rack?._id || "",
        shelfId: fileData.data.shelf?._id || "",
      };

      reset(initialValues);

      // Mark initialization as complete
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
    }
  }, [fileData, housesData, roomsData, racksData, shelvesData, reset]);

  // Reset dependent fields when parent selection changes (only after initialization)
  useEffect(() => {
    if (!isInitializing.current && selectedHouseId) {
      setValue("roomId", "");
      setValue("rackId", "");
      setValue("shelfId", "");
    }
  }, [selectedHouseId, setValue]);

  useEffect(() => {
    if (!isInitializing.current && selectedRoomId) {
      setValue("rackId", "");
      setValue("shelfId", "");
    }
  }, [selectedRoomId, setValue]);

  useEffect(() => {
    if (!isInitializing.current && selectedRackId) {
      setValue("shelfId", "");
    }
  }, [selectedRackId, setValue]);

  // Form submit handler
  const onSubmit = async (data: EditFileFormData) => {
    try {
      const updateData = {
        shelf: data.shelfId,
        status: data.status,
      };
      const result = await updateFile({
        id: id || "",
        data: updateData,
      }).unwrap();

      showToast("File location updated successfully!", "success");

      // Redirect to QR code page with the file ID
      navigate(`/files/${id}/qrcode`);
    } catch (error: any) {
      console.error("Error updating file:", error);
      showToast(
        error?.data?.message || "Failed to update file location",
        "error",
      );
    }
  };

  const departmentOptions = [
    { label: "Building Room", value: "Building Room" },
    { label: "First Floor", value: "First Floor" },
    { label: "Second Floor", value: "Second Floor" },
    { label: "Third Floor", value: "Third Floor" },
  ];

  const handleBack = () => {
    navigate("/files");
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto p-2 space-y-3">
        {/* Breadcrumb */}
        <div className=" px-9 lg:px-0 overflow-x-auto">
          <BreadcrumbNav
            items={[
              { title: "Files", href: "/files" },
              { title: "Edit File", href: `/files/edit/${id}` },
            ]}
          />
        </div>

        {/* Basic Information Section */}
        <Card className="p-4 sm:p-6 shadow-none">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            File Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Feild
              label="Proposal no"
              value={fileData?.data?.proposal_file_no || "Not specified"}
            />
            <Feild
              label="Covered Area"
              value={fileData?.data?.covered_area || "Not specified"}
            />
            <Feild
              label="Plot Area"
              value={fileData?.data?.plot_area || "Not specified"}
            />
            <Feild
              label="Total Floors"
              value={fileData?.data?.total_floor || "Not specified"}
            />
            <Feild
              label="Property Address"
              value={fileData?.data?.property_address || "Not specified"}
            />
            <Feild
              label="district "
              value={fileData?.data?.district || "Not specified"}
            />
            <Feild
              label="proposal circle Address"
              value={fileData?.data?.proposal_circle || "Not specified"}
            />
            <Feild
              label="Current Status"
              value={
                fileData?.data?.status
                  ? fileData.data.status.charAt(0).toUpperCase() +
                    fileData.data.status.slice(1).toLowerCase()
                  : "Not specified"
              }
            />
            <Feild
              label="Owner Name"
              value={fileData?.data?.owners || "Not specified"}
            />
          </div>
        </Card>

        {/* Assign Physical Location Section */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-4 sm:p-6 shadow-none">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Assign Physical Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* House Selection */}
              <div className="space-y-2">
                <Label htmlFor="houseId">
                  Building <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="houseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="houseId"
                        className={
                          errors.houseId
                            ? "border-red-500 "
                            : "border border-gray-200 shadow-none"
                        }
                      >
                        <SelectValue placeholder="Select House" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60 overflow-y-auto  shadow-none">
                        {housesData?.data?.map((house: any) => (
                          <SelectItem key={house._id} value={house._id}>
                            {house.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.houseId && (
                  <p className="text-xs text-red-500">
                    {errors.houseId.message}
                  </p>
                )}
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <Label htmlFor="roomId">
                  Location (Room) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="roomId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedHouseId}
                    >
                      <SelectTrigger
                        id="roomId"
                        className={
                          errors.roomId
                            ? "border-red-500"
                            : "border border-gray-200 shadow-none"
                        }
                      >
                        <SelectValue placeholder="Select Room" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60 overflow-y-auto shadow-none">
                        {roomsData?.data?.map((room: any) => (
                          <SelectItem key={room._id} value={room._id}>
                            Room-{room.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roomId && (
                  <p className="text-xs text-red-500">
                    {errors.roomId.message}
                  </p>
                )}
              </div>

              {/* Rack Selection */}
              <div className="space-y-2">
                <Label htmlFor="rackId">
                  Rack Number <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="rackId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedRoomId}
                    >
                      <SelectTrigger
                        id="rackId"
                        className={
                          errors.rackId
                            ? "border-red-500"
                            : "border border-gray-200 shadow-none"
                        }
                      >
                        <SelectValue placeholder="Select Rack" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-none max-h-[200px] overflow-y-auto">
                        {[...(racksData?.data || [])]
                          .sort((a: any, b: any) => a.number - b.number)
                          .map((rack: any) => (
                            <SelectItem
                              key={rack._id}
                              value={rack._id}
                              className="py-2 px-3 text-sm flex items-center"
                            >
                              R-{rack.number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.rackId && (
                  <p className="text-xs text-red-500">
                    {errors.rackId.message}
                  </p>
                )}
              </div>

              {/* Shelf Selection */}
              <div className="space-y-2">
                <Label htmlFor="shelfId">
                  Shelf Number <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="shelfId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedRackId}
                    >
                      <SelectTrigger
                        id="shelfId"
                        className={
                          errors.shelfId
                            ? "border-red-500"
                            : "border border-gray-200 shadow-none"
                        }
                      >
                        <SelectValue placeholder="Select Shelf" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60 overflow-y-auto shadow-none">
                        {shelvesData?.data?.map((shelf: any) => (
                          <SelectItem key={shelf._id} value={shelf._id}>
                            S-{shelf.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.shelfId && (
                  <p className="text-xs text-red-500">
                    {errors.shelfId.message}
                  </p>
                )}
              </div>

              {fileData?.data?.status && (
                <Controller
                  name="status"
                  control={control}
                  defaultValue={fileData?.data?.status}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <Label>
                        Status <span className="text-red-500">*</span>
                      </Label>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border border-gray-200 shadow-none">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                          <SelectItem value="issued">Issued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row mt-3 justify-end gap-3">
            <Button
              type="button"
              variant={"outline"}
              onClick={handleBack}
              className="shadow-none"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto active:scale-95
   disabled:opacity-70 disabled:cursor-not-allowed px-6 py-2.5 bg-[#047857] hover:bg-teal-700  text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              {isUpdating && (
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
              <Save size={18} />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFile;
