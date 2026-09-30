// AddHouseForm.tsx
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useApiAddHouseMutation } from "../../redux/api";

interface AddHouseFormProps {
  onClose: () => void;
}

export const AddHouseDialog: React.FC<AddHouseFormProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addHouse, { isLoading: isAdding }] = useApiAddHouseMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHouse({ name, address }).unwrap();
      onClose();
      setName("");
      setAddress("");
    } catch (error) {
      console.error("Failed to add house:", error);
    }
  };

  return (
    <div>
      <DialogHeader className="text-left">
        <DialogTitle>Add New Building</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Building Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter building name"
              required
              className="border border-gray-300 shadow-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              required
              className="border border-gray-300 shadow-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={isAdding}
            className="bg-[#047857] text-white hover:bg-teal-700"
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
            {isAdding ? "Adding..." : "Add House"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};
