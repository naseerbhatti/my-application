import  {Skeleton}  from "../ui/skeleton";

const StatsGroupSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((index) => {
        const isSingle = index === 0;

        return (
          <div
            key={index}
            className={`flex gap-2 items-center justify-center ${
              isSingle ? "flex-col" : "flex-row"
            }`}
          >
            {(isSingle ? [1] : [1]).map((_, i) => (
              <div
                key={i}
                className="relative w-full max-w-[260px] aspect-[3/1]"
              >
                {/* Card skeleton */}
                <Skeleton className="w-full h-full  rounded-md" />

                {/* Text overlay skeleton */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default StatsGroupSkeleton;