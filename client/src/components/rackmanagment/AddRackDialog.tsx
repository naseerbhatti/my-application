// AddRackForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  useApiAddRackMutation,
  useApiGetAllHousesQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllRacksQuery,
} from "../../redux/api";

interface AddRackFormProps {
  onClose: () => void;
}

export const AddRackDialog: React.FC<AddRackFormProps> = ({ onClose }) => {
  const [houseId, setHouseId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [number, setNumber] = useState("");
  const [shelfLimit, setShelfLimit] = useState("");
  const [shelfCapacity, setShelfCapacity] = useState("");

  const { data: housesData } = useApiGetAllHousesQuery({ page: 1, limit: 100 });
  const { data: roomsData } = useApiGetAllRoomsQuery(
    { page: 1, limit: 100, house_id: houseId },
    { skip: !houseId },
  );
  const { data: rackData } = useApiGetAllRacksQuery(
    { page: 1, limit: 100, room_id: roomId },
    { skip: !roomId },
  );

  const [addRack, { isLoading }] = useApiAddRackMutation();

  useEffect(() => {
    const rackNumber = rackData?.pagination?.total;
    setNumber(rackNumber ? (rackNumber + 1).toString() : "1");
  }, [rackData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRack({
        house_id: houseId,
        room_id: roomId,
        number: parseInt(number),
        total_shelf: parseInt(shelfLimit),
        shelf_capacity: parseInt(shelfCapacity),
      }).unwrap();
      onClose();
      setHouseId("");
      setRoomId("");
      setNumber("");
      setShelfLimit("");
      setShelfCapacity("");
    } catch (error) {
      console.error("Failed to add rack:", error);
    }
  };

  return (
    <div className=" rounded shadow-none  ">
      <h2 className="text-lg font-semibold mb-4">Add New Rack</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* House select */}
        <div className="grid gap-2">
          <Label htmlFor="house">Select Building</Label>
          <Select value={houseId} onValueChange={setHouseId} required>
            <SelectTrigger className="border border-gray-300 shadow-none">
              <SelectValue placeholder="Select a building" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60 overflow-y-auto">
              {housesData?.data?.map((house: any) => (
                <SelectItem key={house._id} value={house._id}>
                  {house.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room select */}
        <div className="grid gap-2">
          <Label htmlFor="room">Select Room</Label>
          <Select
            value={roomId}
            onValueChange={setRoomId}
            disabled={!houseId}
            required
          >
            <SelectTrigger className="border border-gray-300 shadow-none">
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60 overflow-y-auto">
              {roomsData?.data?.map((room: any) => (
                <SelectItem key={room._id} value={room._id}>
                  Room {room.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rack number */}
        <div className="grid gap-2">
          <Label htmlFor="number">Rack Number</Label>
          <Input
            id="number"
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter rack number"
            required
            className="border border-gray-300 shadow-none"
          />
        </div>

        {/* Total shelves */}
        <div className="grid gap-2">
          <Label htmlFor="shelfLimit">Total Shelf</Label>
          <Input
            id="shelfLimit"
            type="number"
             min={1}
            value={shelfLimit}
            onChange={(e) => setShelfLimit(e.target.value)}
            placeholder="Enter total shelf count"
            required
            className="border border-gray-300 shadow-none"
          />
        </div>

        {/* Shelf capacity */}
        <div className="grid gap-2">
          <Label htmlFor="shelfCapacity">Single Shelf Capacity</Label>
          <Input
            id="shelfCapacity"
            type="number"
             min={1}
            value={shelfCapacity}
            onChange={(e) => setShelfCapacity(e.target.value)}
            placeholder="Enter shelf capacity"
            required
            className="border border-gray-300 shadow-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end mt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#047857] text-white hover:bg-teal-700"
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
            {isLoading ? "Adding..." : "Add Rack"}
          </Button>
        </div>
      </form>
    </div>
  );
};
