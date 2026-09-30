import { Skeleton } from "../ui/skeleton";

function SidebarSkeleton() {
  return (
    <>
      {/* Logo Skeleton */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="flex-1 px-4 space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* User Profile Skeleton */}
      <div className="p-3 border-t border-gray-200 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </>
  );
}

export default SidebarSkeleton;