import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useApiGetAllHousesQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllShelvesQuery,
  useApiGetAllRacksQuery,
} from "@/src/redux/api";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

export interface FilterValues {
  status: string;
  startDate: string;
  endDate: string;
  house: string;
  room: string;
  shelf: string;
  rack: string;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onOpenChange,
  onApplyFilters,
  initialFilters,
}) => {
  const [status, setStatus] = useState(initialFilters?.status || "");
  const [startDate, setStartDate] = useState(initialFilters?.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters?.endDate || "");
  const [selectedHouse, setSelectedHouse] = useState(
    initialFilters?.house || "",
  );
  const [selectedRoom, setSelectedRoom] = useState(initialFilters?.room || "");
  const [selectedRack, setSelectedRack] = useState(initialFilters?.rack || "");
  const [selectedShelf, setSelectedShelf] = useState(
    initialFilters?.shelf || "",
  );
  // const [selectRack, setSelectedRack] = useState(initialFilters?.rack || "" )

  // Fetch houses
  const { data: housesData } = useApiGetAllHousesQuery({});

  // Fetch rooms based on selected house
  const { data: roomsData } = useApiGetAllRoomsQuery(
    selectedHouse ? { house_id: selectedHouse } : {},
  );
  const { data: rackData } = useApiGetAllRacksQuery(
    selectedRoom ? { room_id: selectedRoom } : {},
  );

  // Fetch shelves based on selected room
  const { data: shelvesData } = useApiGetAllShelvesQuery(
    selectedRack ? { rack_id: selectedRack } : {},
  );

  // Fetch rack based on selected rack

  // Reset room when house changes
  useEffect(() => {
    if (selectedHouse) {
      setSelectedRoom("");
      setSelectedShelf("");
      setSelectedRack("");
    }
  }, [selectedHouse]);

  // Reset shelf when room changes
  useEffect(() => {
    if (selectedRoom) {
      setSelectedShelf("");
    }
  }, [selectedRoom]);

  const handleApply = () => {
    onApplyFilters({
      status,
      startDate,
      endDate,
      house: selectedHouse,
      room: selectedRoom,
      shelf: selectedShelf,
      rack: selectedRack,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setSelectedHouse("");
    setSelectedRoom("");
    setSelectedShelf("");
    setSelectedRack("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Filter Files
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-gray-300 shadow-none">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-300 shadow-none"
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-300 shadow-none"
              />
            </div>
          </div>

          {/* House */}
          <div className="grid gap-2">
            <Label>Building</Label>
            <Select value={selectedHouse} onValueChange={setSelectedHouse}>
              <SelectTrigger className="border-gray-300 shadow-none">
                <SelectValue placeholder="Select Building" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none max-h-60 overflow-y-auto">
                <SelectItem value="all">All Building</SelectItem>
                {housesData?.data?.map((house: any) => (
                  <SelectItem key={house._id} value={house._id}>
                    {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room */}
          <div className="grid gap-2">
            <Label>Room</Label>
            <Select
              value={selectedRoom}
              onValueChange={setSelectedRoom}
              disabled={!selectedHouse}
            >
              <SelectTrigger className="border-gray-300 shadow-none">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none max-h-60 overflow-y-auto">
                <SelectItem value="all">All Room</SelectItem>
                {roomsData?.data?.map((room: any) => (
                  <SelectItem key={room._id} value={room._id}>
                    Room {room.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rack */}
          <div className="grid gap-2">
            <Label>Rack</Label>
            <Select
              value={selectedRack}
              onValueChange={setSelectedRack}
              disabled={!selectedRoom}
            >
              <SelectTrigger className="border-gray-300 shadow-none">
                <SelectValue placeholder="Select Rack" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none max-h-60 overflow-y-auto">
                <SelectItem value="all">All Rack</SelectItem>
                {rackData?.data?.map((rack: any) => (
                  <SelectItem key={rack._id} value={rack._id}>
                    Rack {rack.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shelf */}
          <div className="grid gap-2">
            <Label>Shelf</Label>
            <Select
              value={selectedShelf}
              onValueChange={setSelectedShelf}
              disabled={!selectedRack}
            >
              <SelectTrigger className="border-gray-300 shadow-none">
                <SelectValue placeholder="Select shelf" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-none max-h-60 overflow-y-auto">
                <SelectItem value="all">All Shelves</SelectItem>
                {shelvesData?.data?.map((shelf: any) => (
                  <SelectItem key={shelf._id} value={shelf._id}>
                    Shelf {shelf.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto border-gray-300 shadow-none"
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            className="w-full sm:w-auto bg-[#047857] hover:bg-[#047857] text-white"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
