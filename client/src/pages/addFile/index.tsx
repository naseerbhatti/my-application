import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/src/utils/toast";

import {
  useApiAddFileMutation,
  useApiGetAllHousesQuery,
  useApiGetAllRacksQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllShelvesQuery,
  useApiGetSbcaFilesQuery,
} from "@/src/redux/api";
import { useSelector } from "react-redux";
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
import { Input } from "@/src/components/ui/input";
import {
  ComboboxItem,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
} from "@/src/components/ui/combobox";

// Zod validation schema
const addFileSchema = z.object({
  houseId: z.string().min(1, "Please select a house"),
  roomId: z.string().min(1, "Please select a room"),
  rackId: z.string().min(1, "Please select a rack"),
  shelfId: z.string().min(1, "Please select a shelf"),
});

type AddFileFormData = z.infer<typeof addFileSchema>;

export const AddFile = () => {
  const [fileNumber, setFileNumber] = useState<string>("");
  const [debouncedFileNumber, setDebouncedFileNumber] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Get current user from Redux store
  const currentUser = useSelector((state: any) => state.auth.user);

  // Debounce effect for file number input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFileNumber(fileNumber);
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [fileNumber]);

  const { data: SbcaFilesData } = useApiGetSbcaFilesQuery({
    proposal_file_no: debouncedFileNumber,
    limit: 60,
  });

  const [addFile, { isLoading: isAdding }] = useApiAddFileMutation();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddFileFormData>({
    resolver: zodResolver(addFileSchema),
    defaultValues: {
      houseId: "",
      roomId: "",
      rackId: "",
      shelfId: "",
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

  const { data: roomsData } = useApiGetAllRoomsQuery(
    {
      page: 1,
      limit: 100,
      house_id: selectedHouseId || undefined,
    },
    {
      skip: !selectedHouseId,
      refetchOnMountOrArgChange: true,
    },
  );
  const handleSelectFile = (selectedFile: any) => {
    setSelectedFile(
      SbcaFilesData.data.find(
        (file: any) => file.proposal_file_no == selectedFile,
      ),
    );
  };
  // Fetch racks filtered by room (use selectedRoomId or initialRoomId)
  const { data: racksData } = useApiGetAllRacksQuery(
    {
      page: 1,
      limit: 100,
      room_id: selectedRoomId || undefined,
    },
    {
      skip: !selectedRoomId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Fetch shelves filtered by rack (use selectedRackId or initialRackId)
  const { data: shelvesData } = useApiGetAllShelvesQuery(
    {
      page: 1,
      limit: 100,
      rack_id: selectedRackId || undefined,
    },
    {
      skip: !selectedRackId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Auto-select house if there's only one available
  useEffect(() => {
    if (housesData?.data?.length === 1 && !selectedHouseId) {
      setValue("houseId", housesData.data[0]._id);
    }
  }, [housesData, selectedHouseId, setValue]);

  // Auto-select room if there's only one available in the selected house
  useEffect(() => {
    if (roomsData?.data?.length === 1 && selectedHouseId && !selectedRoomId) {
      setValue("roomId", roomsData.data[0]._id);
    }
  }, [roomsData, selectedHouseId, selectedRoomId, setValue]);

  // Auto-select rack if there's only one available in the selected room
  useEffect(() => {
    if (racksData?.data?.length === 1 && selectedRoomId && !selectedRackId) {
      setValue("rackId", racksData.data[0]._id);
    }
  }, [racksData, selectedRoomId, selectedRackId, setValue]);

  // Auto-select shelf if there's only one available in the selected rack
  useEffect(() => {
    if (shelvesData?.data?.length === 1 && selectedRackId) {
      setValue("shelfId", shelvesData.data[0]._id);
    }
  }, [shelvesData, selectedRackId, setValue]);

  // Form submit handler
  const onSubmit = async (data: AddFileFormData) => {
    if (!selectedFile) {
      showToast("Please select a file first", "error");
      return;
    }

    try {
      // Generate a unique file number based on the proposal file number and timestamp
      const fileNumber = `${selectedFile.proposal_file_no}`;

      const addFiledata = {
        number: fileNumber,
        proposal_file_no: selectedFile.proposal_file_no,
        plot_area: selectedFile.plot_area,
        owners: selectedFile?.owners,
        property_address: selectedFile.property_address,
        covered_area: selectedFile.covered_area,
        total_floor: selectedFile.total_floor,
        plan_type: selectedFile.plan_type,
        proposal_circle: selectedFile.proposal_circle,
        district: selectedFile.district,
        shelf: data.shelfId,
        status: "available",
        added_by: currentUser._id,
      };

      const result = await addFile({
        ...addFiledata,
      }).unwrap();

      showToast("File added successfully!", "success");

      // Reset form and selections
      reset();
      setSelectedFile(null);
      setFileNumber("");
      // Redirect to QR code page with the file ID
      navigate(`/files/${result.data._id}/qrcode`);
    } catch (error: any) {
      console.error("Error adding file:", error);
      showToast(error?.data?.message || "Failed to add file", "error");
    }
  };

  const handleBack = () => {
    navigate("/files");
  };

  return (
    <div className="h-full">
      <div className="w-full max-w-7xl mx-auto  p-2 space-y-3">
        {/* Breadcrumb */}
        <div className="px-9 lg:px-0">
          <BreadcrumbNav
            items={[{ title: "Files", href: "/files" }, { title: "Add File" }]}
          />
        </div>

        {/* Basic Information Section */}
        <Card className="p-4  shadow-none">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Combobox
              items={
                SbcaFilesData?.data?.filter((item: any) => !item.file_exted) ||
                []
              }
            >
              <ComboboxInput
                placeholder={
                  selectedFile ? selectedFile.proposal_file_no : "File Number"
                }
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
              />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      onClick={() => handleSelectFile(item.proposal_file_no)}
                      key={item._id}
                      value={item.proposal_file_no}
                    >
                      {/* {`${item.proposal_file_no} - ${
                        item.file_exted ? "Already Added" : "Not Added"
                      }`} */}
                      {/* {`${item.proposal_file_no} • ${
                        item.file_exted ? "Added " : "New File "
                      }`} */}
                      {`${item.proposal_file_no} • ${
                        item.file_exted
                          ?  "Added" : "New File"
                      }`}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Feild
              label="Covered Area"
              value={selectedFile?.covered_area || "Not specified"}
            />
            <Feild
              label="Plot Area"
              value={selectedFile?.plot_area || "Not specified"}
            />
            <Feild
              label="Total Floors"
              value={selectedFile?.total_floor || "Not specified"}
            />
            <Feild
              label="Property Address"
              value={selectedFile?.property_address || "Not specified"}
            />
            <Feild
              label="Proposal Circle"
              value={selectedFile?.proposal_circle || "Not specified"}
            />
            <Feild
              label="District  Address"
              value={selectedFile?.district || "Not specified"}
            />
            <Feild
              label="Owner Name"
              value={selectedFile?.owners || "Not specified"}
            />
          </div>
        </Card>

        {/* Assign Physical Location Section */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-4  shadow-none">
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
                      <SelectContent className="bg-white shadow-none max-h-[200px] overflow-y-auto">
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
                      <SelectContent className="bg-white shadow-none max-h-[200px] overflow-y-auto">
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
                        {racksData?.data?.map((rack: any) => (
                          <SelectItem key={rack._id} value={rack._id}>
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
                      <SelectContent className="bg-white shadow-none max-h-[200px] overflow-y-auto">
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
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row mt-3 justify-end gap-3">
            <Button
              type="button"
              variant={"outline"}
              onClick={handleBack}
              className=""
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isAdding}
              className="w-full sm:w-auto active:scale-95
   disabled:opacity-70 disabled:cursor-not-allowed px-6 py-2.5 bg-[#047857] hover:bg-teal-700  text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              {isAdding && (
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
              {isAdding ? "Adding..." : "Add File"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFile;
