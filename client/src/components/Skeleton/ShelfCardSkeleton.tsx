import React from "react";
import { Skeleton } from "@/src/components/ui/skeleton";

export function ShelfCardSkeleton() {
  return (
    <div className="relative rounded-xl border border-gray-200 shadow-none overflow-hidden animate-pulse">
      {/* Split container */}
      <div className="flex h-full items-start">
        {/* Left Half - Green boxes */}
        <div className="w-1/2 p-2 grid grid-cols-3 gap-1 items-start">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-md bg-green-200" />
            ))}
        </div>

        {/* Right Half - Orange boxes */}
        <div className="w-1/2 bg-white p-2 grid grid-cols-3 gap-1 content-start">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded bg-orange-200" />
            ))}
        </div>
      </div>

      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50">
        <Skeleton className="h-6 w-20 mb-1 rounded" /> {/* Shelf Number */}
        <Skeleton className="h-4 w-24 rounded mb-1" /> {/* Total Files */}
        <Skeleton className="h-4 w-24 rounded mb-1" /> {/* Issue Files */}
        <Skeleton className="h-4 w-24 rounded" /> {/* Available Files */}
      </div>
    </div>
  );
}