import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table";
import { Skeleton } from "@/src/components/ui/skeleton";

interface CustomTableSkeletonProps {
  columns: { key: string; label: string }[];
  rows?: number;
}

export function CustomTableSkeleton({ columns, rows = 5 }: CustomTableSkeletonProps) {
  return (
    <div className="rounded-md border border-gray-200 shadow-none overflow-x-auto">
      <Table className="min-w-[500px] sm:min-w-full">
        <TableHeader className="bg-gray-50/50 border-b border-gray-200">
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="h-14 px-4 sm:px-6 text-start text-sm text-gray-800"
              >
                {col.label}
                {/* <Skeleton className="h-4 w-20" /> */}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {[...Array(rows)].map((_, i) => (
            <TableRow key={i} className="border-b last:border-b-0 border-gray-200">
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className="px-4 sm:px-6 py-3 text-start text-sm"
                >

                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
        {[...Array(Math.min(3, columns.length))].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>
  );
}