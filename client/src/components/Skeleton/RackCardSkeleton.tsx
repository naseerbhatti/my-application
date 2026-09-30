import React from "react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface RackCardSkeletonProps {
  shelvesCount?: number; // kitne shelf skeleton show karne hain
}

export const RackCardSkeleton: React.FC<RackCardSkeletonProps> = ({
  shelvesCount = 3,
}) => {
  return (
    <Card className="border-gray-200 shadow-none rounded-md overflow-hidden">
      {/* Shelves Grid Skeleton */}
      <div className="grid grid-cols-3 gap-8 p-2 sm:p-3">
        {Array.from({ length: shelvesCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-32  rounded-md bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8 p-2 sm:p-3">
        {Array.from({ length: shelvesCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-32  rounded-md bg-gray-200" />
        ))}
      </div>

      {/* Bottom Info Skeleton */}
      <div className="border-t border-gray-200 p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 gap-2">
        {/* Rack Number Skeleton */}
        <Skeleton className="h-5 w-14 rounded-md bg-gray-200" />

        {/* Delete Button Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
      </div>
    </Card>
  );
};
