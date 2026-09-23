import React from "react";
import { Button } from "../ui/button";

interface Shelf {
  _id: string;
  number: number;
  file_occupied: number;
  file_limit: number;
}

interface ShelfGridProps {
  shelves: Shelf[];
  onShelfClick?: (shelf: Shelf) => void;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({
  shelves,
  onShelfClick,
}) => {
  return (
    <div className="grid cursor-pointer  grid-cols-3  gap-4 p-4">
      {shelves.map((shelf, i) => (
        <Button
          key={`${shelf._id}-${i}`}
          variant="outline"
          className="h-20 text-gray-700 shadow-none hover:bg-gray-50 border-gray-200"
          onClick={() => onShelfClick?.(shelf)}
        >
          Shelf {String(shelf.number).padStart(2, "0")}
        </Button>
      ))}
    </div>
  );
};
