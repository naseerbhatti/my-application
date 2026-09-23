import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function FilesTrendChartSkeleton() {
  return (
    <Card className="border p-3 rounded-md shadow-none bg-white border-gray-200 w-full">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          {/* Title */}
          <Skeleton className="h-5 w-28" />

          {/* Legend */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Chart Bars */}
  <CardContent>
  <div className="w-full h-[240px] flex items-end gap-3 px-2">
    {/* 7 days */}
    {[...Array(7)].map((_, index) => (
      <div
        key={index}
        className="flex-1 flex items-end justify-center gap-1"
      >
        {/* newFiles */}
        <Skeleton className="w-[9px] h-[65%] rounded-t-sm" />

        {/* issued */}
        <Skeleton className="w-[9px] h-[45%] rounded-t-sm" />

        {/* returned */}
        <Skeleton className="w-[9px] h-[30%] rounded-t-sm" />
      </div>
    ))}
  </div>
</CardContent>
    </Card>
  );
}