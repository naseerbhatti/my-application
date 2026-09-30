// AddRoomForm.tsx
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
  useApiAddRoomMutation,
  useApiGetAllHousesQuery,
  useApiGetAllRoomsQuery,
  useGetLastRoomNumberQuery,
} from "../../redux/api";

interface AddRoomFormProps {
  onClose: () => void;
}

export const AddRoomDialog: React.FC<AddRoomFormProps> = ({ onClose }) => {
  const [houseId, setHouseId] = useState("");
  const [count, setCount] = useState("1");

  const [start, setStart] = useState("1");
  const [end, setEnd] = useState("1");
  const { data: housesData } = useApiGetAllHousesQuery({ page: 1, limit: 100 });
  const { data: getAllRoom } = useApiGetAllRoomsQuery(
    { house_id: houseId, page: 1, limit: 10 },
    { skip: !houseId },
  );
  const { data: getlastroomdata } = useGetLastRoomNumberQuery(houseId, {
    skip: !houseId,
    refetchOnMountOrArgChange: true, // jab tak house select na ho
  });

  const roomNumbers = getAllRoom?.data.length;
  const [number, setNumber] = useState("1");

  useEffect(() => {
    setNumber(roomNumbers ? (roomNumbers + 1).toString() : "1");
  }, [roomNumbers]);

  const [addRoom, { isLoading }] = useApiAddRoomMutation();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     await addRoom({
  //       house_id: houseId,
  //       number: parseInt(number),
  //       start: parseInt(start),
  //       end: parseInt(end),
  //     }).unwrap();

  //     // Reset form
  //     setNumber("");
  //     setStart("");
  //     setEnd("");
  //     setHouseId("");

  //     onClose();
  //   } catch (error) {
  //     console.error("Failed to add room:", error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addRoom({
        house_id: houseId,
        count: parseInt(count),
      }).unwrap();

      setHouseId("");
      setCount("1");
      onClose();
    } catch (error) {
      console.error("Failed to add room:", error);
    }
  };

  // useEffect(() => {
  //   if (getlastroomdata?.lastNumber !== undefined) {
  //     const next = getlastroomdata.lastNumber + 1;
  //     setStart(next.toString());
  //     setEnd(next.toString());
  //   } else if (houseId) {
  //     // Agar koi room nahi hai us house mein
  //     setStart("1");
  //     setEnd("1");
  //   }
  // }, [getlastroomdata, houseId]);

  return (
    <div className=" rounded shadow-none">
      <h2 className="text-lg font-semibold mb-4">Add New Room</h2>
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
                  {house?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>How many rooms to create?</Label>

          <Input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 5"
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
            {isLoading ? "Adding..." : "Add Room"}
          </Button>
        </div>
      </form>
    </div>
  );
};
