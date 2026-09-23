"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  className?: string;
  cellClassName?: string;
  render?: (row: any, index: number) => React.ReactNode;
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function CustomTable({
  columns,
  data,
  page = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  emptyMessage = "No data available",
}: CustomTableProps) {
  return (
    <div className="border border-gray-200 rounded-md shadow-none flex flex-col">

      {/*  Tabel */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[500px] w-full">
          <TableHeader className="bg-gray-50/50 border-b last:border-b-0 border-gray-200">
            <TableRow className="border-b-gray-100 hover:bg-gray-50/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    col.className ||
                    "h-14 px-4 sm:px-6 text-start text-sm sm:text-sm text-gray-800"
                  }
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i} className="border-b last:border-b-0 border-gray-200">
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={
                        col.cellClassName ||
                        "px-4 sm:px-6 py-3 text-start text-sm sm:text-sm"
                      }
                    >
                      {col.render ? col.render(row, i) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/*  Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex flex-wrap justify-center gap-2 py-4 border-t border-gray-100">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {page > 3 && (
            <>
              <button onClick={() => onPageChange(1)} className="h-8 w-8 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">1</button>
              {page > 4 && <span className="flex items-center px-2 text-gray-400">...</span>}
            </>
          )}

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;

            if (pageNum < 1 || pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 rounded-md text-sm font-medium ${
                  page === pageNum ? "bg-green-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {page < totalPages - 2 && totalPages > 5 && (
            <>
              {page < totalPages - 3 && <span className="flex items-center px-2 text-gray-400">...</span>}
              <button onClick={() => onPageChange(totalPages)} className="h-8 w-8 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">{totalPages}</button>
            </>
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}