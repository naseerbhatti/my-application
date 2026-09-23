import { useApiGetShelfFilesQuery } from "@/src/redux/api";
import { useState } from "react";
import ViewShlefCard from "@/src/components/rackmanagment/ViewShlefCard";

function ShelfCard({ shelf }: { shelf: any }) {
  const { data: shelfFileData } = useApiGetShelfFilesQuery(shelf?._id, {
    skip: !shelf?._id,
  });
  const [showViewShelf, setShowViewShelf] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<any>(null);

  const shelfFilesDataValue = shelfFileData?.data || [];

  return (
    <div className="relative rounded-xl border border-gray-200 shadow-none overflow-hidden">
      {/* Split container */}
      <div className="flex h-full items-start ">
        {/* Left Half - Green boxes */}
        <div className="w-1/2 p-2 grid grid-cols-3 gap-1 items-start">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-full aspect-square bg-[#10B9814D] rounded-md"
              />
            ))}
        </div>

        {/* Right Half - Orange boxes */}
        <div className="w-1/2 bg-white p-2 grid grid-cols-3 gap-1 content-start">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-full aspect-square bg-[#F59E0B4D] rounded"
              />
            ))}
        </div>
      </div>

      {/* Center Text Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center  justify-center bg-white/80"
        onClick={() => {
          setSelectedShelf(shelf); // set the clicked shelf
          setShowViewShelf(true); // open the modal
        }}
      >
        <span className="text-lg text-black font-semibold">
          Shelf {String(shelf.number).padStart(2, "0")}
        </span>
        <p className="text-sm text-gray-600">
          Total Files: {shelfFilesDataValue?.totalFiles || 0}
        </p>
        <p className="text-sm text-gray-600">
          Issue Files: {shelfFilesDataValue?.issuedFiles || 0}
        </p>
        <p className="text-sm text-gray-600">
          Available Files: {shelfFilesDataValue?.availableFiles || 0}
        </p>
        <p className="text-sm text-gray-600">
          Capacity: {shelf?.capacity || 0}
        </p>
      </div>
      <ViewShlefCard
        open={showViewShelf}
        onOpenChange={setShowViewShelf}
        shelf={selectedShelf}
      />
    </div>
  );
}

export default ShelfCard;
