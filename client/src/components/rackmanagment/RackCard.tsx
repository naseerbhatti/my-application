import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Trash, Trash2 } from "lucide-react";
import { ShelfGrid } from "./ShelfGrid";
import { useNavigate } from "react-router-dom";
import { can } from "@/src/utils/permisson";

interface Shelf {
  _id: string;
  number: number;
  file_occupied: number;
  file_limit: number;
}

interface Rack {
  _id: string;
  number: number;
  room?: {
    house?: {
      name: string;
    };
  };
  shelf_limit: number;
  shelf_occupied: number;
  shelves?: Shelf[];
  userPermissions?: any;
}

interface RackCardProps {
  rack: Rack;
  onDelete?: (rackId: string) => void;
  onShelfClick?: (shelf: Shelf) => void;
  userPermissions?: any;
}

export const RackCard: React.FC<RackCardProps> = ({
  rack,
  onDelete,
  onShelfClick,
  userPermissions,
}) => {
  const navigate = useNavigate();

  const handleRackDetail = (id: string) => {
    navigate(`/rack-management/${id}`);
  };

  return (
    <Card
      className="border-gray-200 shadow-none rounded-md overflow-hidden cursor-pointer"
      onClick={() => handleRackDetail(rack._id)}
    >
      {/* Shelves Grid */}
      <ShelfGrid shelves={rack.shelves || []} onShelfClick={onShelfClick} />

      {/* Bottom Info + Actions */}
      <div className="border-t border-gray-200 p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 gap-2">
        {/* Rack + House Info */}
        <div className="flex flex-col">
          {/* Rack Number */}
          <span className="text-sm font-medium text-gray-700">
            R - {String(rack.number).padStart(2, "0")}
          </span>

          {/* House Name */}
          <span className="text-xs text-gray-500">
            {rack.room?.house?.name}
          </span>
        </div>

        {can(userPermissions, "RACK", "DELETE") && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600 self-end sm:self-auto"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(rack._id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};
