import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function RackCapacityChartSkeleton() {
  return (
    <Card className="border rounded-md shadow-none bg-white border-gray-200">
      {/* Header */}
      <CardHeader className="flex items-center justify-between w-full px-4 py-3">
        <Skeleton className="h-5 w-28" /> {/* Title */}
        <Skeleton className="h-4 w-16" /> {/* Month */}
      </CardHeader>

      {/* Chart Area */}
      <CardContent className="flex items-center justify-center py-4">
        <div className="relative h-[220px] w-[220px]">
          {/* Circle skeleton for pie chart */}
          <Skeleton className="rounded-full w-full h-full" />
        </div>
      </CardContent>

      {/* Legend */}
      <div className="flex justify-start items-center pl-6 gap-4 pb-4">
        {[1, 2].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}