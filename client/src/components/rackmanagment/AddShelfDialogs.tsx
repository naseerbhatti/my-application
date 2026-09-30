// AddShelfForm.tsx
import React, { useEffect, useState } from "react";
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
  useApiAddShelfMutation,
  useApiGetAllHousesQuery,
  useApiGetAllRoomsQuery,
  useApiGetAllRacksQuery,
  useApiGetAllShelvesQuery,
} from "@/src/redux/api";

interface AddShelfFormProps {
  onClose: () => void;
}

const AddShelfForm: React.FC<AddShelfFormProps> = ({ onClose }) => {
  const [houseId, setHouseId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rackId, setRackId] = useState("");
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const { data: housesData } = useApiGetAllHousesQuery({ page: 1, limit: 100 });
  const { data: roomsData } = useApiGetAllRoomsQuery(
    { page: 1, limit: 100, house_id: houseId },
    { skip: !houseId },
  );
  const { data: racksData } = useApiGetAllRacksQuery(
    { page: 1, limit: 100, room_id: roomId },
    { skip: !roomId },
  );
  const { data: shelvesData } = useApiGetAllShelvesQuery(
    { page: 1, limit: 1000, rack_id: rackId },
    { skip: !rackId },
  );

  const [addShelf, { isLoading }] = useApiAddShelfMutation();

  useEffect(() => {
    const shelfNumber = shelvesData?.pagination?.total;
    setNumber(shelfNumber ? (shelfNumber + 1).toString() : "1");
  }, [shelvesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addShelf({
        rack_id: rackId,
        number: parseInt(number),
        capacity: parseInt(capacity),
      }).unwrap();

      // Reset form
      setHouseId("");
      setRoomId("");
      setRackId("");
      setNumber("");
      setCapacity("");

      onClose();
    } catch (error) {
      console.error("Failed to add shelf:", error);
    }
  };

  return (
    <div className="bg-white  rounded ">
      <h2 className="text-lg font-semibold mb-4">Add New Shelf</h2>
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

        {/* Rack select */}
        <div className="grid gap-2">
          <Label htmlFor="rack">Select Rack</Label>
          <Select
            value={rackId}
            onValueChange={setRackId}
            disabled={!roomId}
            required
          >
            <SelectTrigger className="border border-gray-300 shadow-none">
              <SelectValue placeholder="Select a rack" />
            </SelectTrigger>

            {/* Scrollable dropdown */}
            <SelectContent className="bg-white max-h-[200px] overflow-y-auto shadow-none">
              {[...(racksData?.data || [])]
                .sort((a: any, b: any) => a.number - b.number)
                .map((rack: any) => (
                  <SelectItem key={rack._id} value={rack._id}>
                    {`R-${String(rack.number).padStart(2, "0")}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shelf number */}
        <div className="grid gap-2">
          <Label htmlFor="number">Shelf Number</Label>
          <Input
            id="number"
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter shelf number"
            required
            className="border border-gray-300 shadow-none"
          />
        </div>

        {/* Shelf capacity */}
        <div className="grid gap-2">
          <Label htmlFor="capacity">Shelf Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
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
            {isLoading ? "Adding..." : "Add Shelf"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddShelfForm;
