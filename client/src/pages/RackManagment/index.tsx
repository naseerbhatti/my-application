import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Plus } from "lucide-react";
import { RackCard } from "../../components/rackmanagment";

import { AddDataDialog } from "../../components/rackmanagment/AddData";

import {
  useApiGetAllHousesQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllRacksQuery,
  useApiGetAllShelvesQuery,
  useApiDeleteRackMutation,
} from "../../redux/api";
import StatsGroup from "@/src/components/shared/StatsGroup";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import { DeleteConfirmDialog } from "@/src/components/shared/DeleteComp";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import StatsGroupSkeleton from "@/src/components/Skeleton/StatsGroupSkeleton";
import { RackCardSkeleton } from "@/src/components/Skeleton/RackCardSkeleton";
import { useDebounce } from "@/src/hooks/index";
import { can } from "@/src/utils/permisson";

function RackManagment() {
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectRackId, setSelectRackId] = useState<string | null>(null);
  const [showAddData, setShowAddData] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch data
  const { data: housesData, isLoading: housesLoading } =
    useApiGetAllHousesQuery({ page: 1, limit: 100 });
  const { data: roomsData, isLoading: roomsLoading } = useApiGetAllRoomsQuery({
    page: 1,
    limit: 1000,
  });
  const { data: racksData, isLoading: racksLoading } = useApiGetAllRacksQuery({
    page: 1,
    limit: 1000,
    search: debouncedSearch,
  });
  const { data: shelvesData, isLoading: shelvesLoading } =
    useApiGetAllShelvesQuery({
      page: 1,
      limit: 10000,
    });

  const [deleteRack, { isLoading }] = useApiDeleteRackMutation();

  const userPermissions = user?.permissions || {};

  // Stats
  const totalHouses = housesData?.data?.length || 0;
  const totalRooms = roomsData?.data?.length || 0;
  const totalRacks = racksData?.data?.length || 0;

  const totalShelves = shelvesData?.data?.length || 0;

  const racksWithShelves = racksData?.data?.map((rack: any) => {
    const matchedShelves =
      shelvesData?.data
        ?.filter(
          (shelf: any) =>
            shelf.rack?._id === rack._id || shelf.rack === rack._id,
        )
        ?.sort((a: any, b: any) => (a.number ?? 0) - (b.number ?? 0)) || [];

    const fallbackShelves = Array.from(
      { length: rack.total_shelf || 0 },
      (_, i) => ({
        _id: `${rack._id}-${i + 1}`,
        number: i + 1,
      }),
    );

    return {
      ...rack,
      shelves: matchedShelves.length > 0 ? matchedShelves : fallbackShelves,
    };
  });

  const handleDeleteClick = (rackId: string) => {
    setSelectRackId(rackId);
    setDeleteDialog(true);
  };

  const handleConfrimDelete = async () => {
    if (!selectRackId) return;
    try {
      await deleteRack(selectRackId).unwrap();
      setDeleteDialog(false);
      setSelectRackId(null);
    } catch (error) {
      console.error("Failed to delete rack:", error);
    }
  };

  return (
    <div className="p-2 space-y-3">
      {/* Header */}
      <div className="px-9 lg:px-0">
        <BreadcrumbNav items={[{ title: "Racks" }]} />
      </div>

      {housesLoading || roomsLoading || racksLoading || shelvesLoading ? (
        <StatsGroupSkeleton />
      ) : (
        <StatsGroup
          stats={[
            { label: "Total Buildings", value: totalHouses },
            { label: "Total Rooms", value: totalRooms },
            { label: "Total Racks", value: totalRacks },
            { label: "Total Shelves", value: totalShelves },
          ]}
        />
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-full sm:max-w-2xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search rack"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 py-3 sm:py-4 w-full border border-gray-200 shadow-none"
          />
        </div>
        {can(userPermissions, "RACK", "WRITE") && (
          <Button
            className="bg-[#047857] text-white hover:bg-[#047857]"
            onClick={() => setShowAddData(true)}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {/* Racks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {racksWithShelves?.map((rack: any) =>
          shelvesLoading ? (
            <RackCardSkeleton key={rack._id} />
          ) : (
            <RackCard
              key={rack._id}
              rack={rack}
              onDelete={handleDeleteClick}
              userPermissions={user?.permissions}
            />
          ),
        )}
      </div>
      <AddDataDialog
        open={showAddData}
        onOpenChange={setShowAddData}
        user={user}
      />

      <DeleteConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleConfrimDelete}
        loading={isLoading}
        title="Delete Rack"
        description="Are you sure you want to delete this rack? This action cannot be undone."
      />
    </div>
  );
}

export default RackManagment;
