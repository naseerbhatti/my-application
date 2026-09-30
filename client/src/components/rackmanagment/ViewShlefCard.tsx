import React from "react";
import {
  useApiGetShelfFilesQuery,
  useApiGetAllFilesQuery,
} from "@/src/redux/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import CustomTable from "@/src/components/shared/CustomTable";
import StatsGroup from "@/src/components/shared/StatsGroup";
import StatusBadge from "../shared/StatusBadge";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useState } from "react";

interface ViewShlefCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shelf: any;
}

function ViewShlefCard({ open, onOpenChange, shelf }: ViewShlefCardProps) {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: shelfFileData, isLoading } = useApiGetShelfFilesQuery(
    shelf?._id,
    {
      skip: !shelf?._id,
    },
  );

  const data = shelfFileData?.data || {};

  const { data: allFilesData, isLoading: allFilesLoading } =
    useApiGetAllFilesQuery(
      {
        page,
        limit: 5,
        search: searchQuery,
        shelf: shelf?._id,
      },

      {
        skip: !open || !shelf?._id,
      },
    );

  const allFiles = allFilesData?.data?.files || [];

  const totalPages = allFilesData?.data?.pagination?.pages || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1); // Reset to first page on new search
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] rounded-lg sm:max-w-md max-h-[90vh] flex flex-col p-3 sm:p-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Shelf {String(shelf?.number).padStart(2, "0")}
          </DialogTitle>
        </DialogHeader>

        {/* Shelf summary in one line, responsive */}
        <div className="flex flex-col sm:flex-row justify-around items-center p-4 mb-4 bg-gray-100 rounded-md text-center space-y-2 sm:space-y-0">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-800">
              {/* {total?.totalFiles || 0} */}
              {data?.totalFiles || 0}
            </span>
            <span className="text-sm text-gray-700">Total Files</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-700">
              {/* {total?.issuedFiles || 0} */}
              {data?.issuedFiles || 0}
            </span>
            <span className="text-sm text-gray-700">Issued Files</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-700 ">
              {/* {total?.availableFiles || 0} */}
              {data?.availableFiles || 0}
            </span>
            <span className="text-sm text-gray-500">Available Files</span>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Search wrapper */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input
              placeholder="Search file"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 py-4 w-full border border-gray-200 shadow-none"
            />
          </div>

          {/* Table scrollable */}
          <div className="flex-1 min-h-0  overflow-y-auto">
            {allFilesLoading ? (
              <div className="p-6 text-center">Loading files...</div>
            ) : (
              <CustomTable
                data={allFiles}
                columns={[
                  {
                    key: "number",
                    label: "File No",
                    render: (file: any) => (
                      <div>
                        <div className="font-medium">
                          {file?.proposal_file_no}
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.total_floor || "N/A"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "createdAt",
                    label: "Issue Date",
                    render: (file: any) => formatDate(file.createdAt),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (file: any) => <StatusBadge status={file.status} />,
                  },
                ]}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewShlefCard;
