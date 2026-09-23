import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useApiGetAllFilesQuery,
  useApiGetDashboardStatsQuery,
  useApiMarkFileMissingMutation,
  useLazyApiExportFilesQuery,
} from "../../redux/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Eye,
  Edit,
  Plus,
  FileText,
  Pencil,
  MoveUpRight,
  MoveDownLeft,
  ListFilter,
  AlertCircle,
} from "lucide-react";
import StatsGroup from "@/src/components/shared/StatsGroup";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import CustomTable from "@/src/components/shared/CustomTable";
import {
  FilterDialog,
  FilterValues,
} from "@/src/components/Files/FilterDialog";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { can } from "@/src/utils/permisson";
import { useSelector } from "react-redux";
import StatsGroupSkeleton from "@/src/components/Skeleton/StatsGroupSkeleton";
import { CustomTableSkeleton } from "@/src/components/Skeleton/CustomTableSkeleton";
import ExportLogsButton from "@/src/components/Files/ExportLogsButton";
import { showToast } from "@/src/utils/toast";
import { MissingFileModal } from "@/src/components/Files/MissingFileModel";

interface Shelf {
  _id: string;
  number: number;
  rack: {
    _id: string;
    number: number;
    room: {
      _id: string;
      number: number;
      house: {
        _id: string;
        name: string;
      };
    };
  };
}

interface File {
  _id: string;
  proposal_file_no: string;
  plot_area?: string;
  property_address?: string;
  covered_area?: string;
  total_floor?: string;
  plan_type?: string;
  district?: string;
  proposal_circle: string;
  number: string;
  applicant: string;
  shelf: Shelf;
  status: "issued" | "available" | "missing";
  createdAt: string;
  description?: string;
}

function Files() {
  const [page, setPage] = useState(1);
  const [exportFilters, setExportFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMissingFileModel, setShowMissingFileModel] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    status: "",
    startDate: "",
    endDate: "",
    house: "",
    room: "",
    shelf: "",
    rack: "",
  });
  const navigate = useNavigate();

  const { data: dashboardStats } = useApiGetDashboardStatsQuery();

  const { data, isLoading, error } = useApiGetAllFilesQuery({
    page,
    limit: 10,
    search: searchQuery,
    status: filters.status && filters.status !== "all" ? filters.status : "",
    startDate: filters.startDate,
    endDate: filters.endDate,
    house: filters.house && filters.house !== "all" ? filters.house : "",
    room: filters.room && filters.room !== "all" ? filters.room : "",
    shelf: filters.shelf && filters.shelf !== "all" ? filters.shelf : "",
    rack: filters.rack && filters.rack !== "all" ? filters.rack : "",
  });

  const [markMissing] = useApiMarkFileMissingMutation();

  const handleMissing = async (id: string) => {
    try {
      await markMissing(id).unwrap();
      showToast("File marked as missing", "success");
    } catch (err) {
      showToast("Failed to mark missing", "error");
    }
  };

  const handleConfirmMissing = () => {
    if (!selectedFileId) return;

    handleMissing(selectedFileId); // tumhara existing function
    setShowMissingFileModel(false);
  };
  const [triggerExport, { isFetching: exportloading }] =
    useLazyApiExportFilesQuery();
  const handleExport = async (payload: any) => {
    try {
      if (exportFilters.startDate && exportFilters.endDate) {
        if (
          new Date(exportFilters.startDate) > new Date(exportFilters.endDate)
        ) {
          showToast("Start date must be earlier than end date.", "error");
          return;
        }
      }

      const exportdata = await triggerExport({
        status: payload?.status || "all",
        startDate: payload?.startDate || undefined,
        endDate: payload?.endDate || undefined,
        house: filters.house || undefined,
        room: filters.room || undefined,
        shelf: filters.shelf || undefined,
        rack: filters.rack || undefined,
        search: searchQuery || undefined,
      }).unwrap();

      const blob = new Blob([exportdata], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `files_export_${Date.now()}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showToast("Export failed", "error");
    }
  };

  const { user } = useSelector((state: any) => state.auth);

  const userPermissions = user?.permissions || {};

  const formatLocation = (file: File) => {
    if (!file.shelf) return "N/A";
    const room = file.shelf.rack?.number || "?";
    const shelf = file.shelf.number || "?";
    return (
      <div className="flex gap-1 flex-nowrap whitespace-nowrap">
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          R-{room}
        </Badge>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          S-{shelf}
        </Badge>
      </div>
    );
  };

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
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleViewFile = (file: File) => {
    navigate(`/files/${file._id}`, { state: { file } });
  };

  const handleEditFile = (file: File) => {
    navigate(`/files/edit/${file._id}`, { state: { file } });
  };

  const handleAddFile = () => {
    navigate(`/files/add`);
  };

  const hasActiveFilters =
    filters.status ||
    filters.startDate ||
    filters.endDate ||
    filters.house ||
    filters.room ||
    filters.rack ||
    filters.shelf;

  const totalPages = data?.data?.pagination?.pages || 1;
  const totalFiles = data?.data?.pagination?.total || 0;
  // Calculate stats
  const totalFile = dashboardStats?.data?.totalFile || 0;
  const issuedCount = dashboardStats?.data?.issueFile || 0;
  const availableFile = dashboardStats?.data?.availableFile || 0;
  const missingFile = dashboardStats?.data?.missingFile || 0;

  return (
    <div className="p-2   space-y-3">
      {/* Header */}
      <div className="px-9 lg:px-0">
        <BreadcrumbNav items={[{ title: "Files", href: "/files" }]} />
      </div>

      {isLoading ? (
        <StatsGroupSkeleton />
      ) : (
        <StatsGroup
          stats={[
            {
              label: "Total Files",
              value: totalFile,
            },
            {
              label: "Issued Files",
              value: issuedCount,
            },
            {
              label: "Available Files",
              value: availableFile,
            },
            {
              label: "Missing Files",
              value: missingFile,
            },
          ]}
        />
      )}

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-3 w-full md:flex-1">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute rounded-md left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search file"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 py-4 w-full border border-gray-200 shadow-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative inline-block">
            <Button
              variant="outline"
              className="w-full sm:w-auto shadow-none border border-gray-200 gap-2"
              onClick={() => setShowFilterDialog(true)}
            >
              <ListFilter />
              Filter
            </Button>
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            )}
          </div>

          {can(userPermissions, "FILE", "EXPORT") && (
            <div className="w-full sm:w-auto">
              <ExportLogsButton
                exportloading={exportloading}
                startDate={exportFilters.startDate}
                endDate={exportFilters.endDate}
                setStartDate={(date) =>
                  setExportFilters((prev: any) => ({
                    ...prev,
                    startDate: date,
                  }))
                }
                setEndDate={(date) =>
                  setExportFilters((prev: any) => ({ ...prev, endDate: date }))
                }
                onExport={(status) => {
                  handleExport({
                    status,
                    startDate: exportFilters.startDate,
                    endDate: exportFilters.endDate,
                  });
                }}
              />
            </div>
          )}

          {can(userPermissions, "FILE", "WRITE") && (
            <Button
              onClick={handleAddFile}
              className="w-full sm:w-auto bg-[#047857] hover:bg-[#065f46] text-white shadow-none"
            >
              <Plus className="h-4 w-4" />
              Add File
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <CustomTableSkeleton
          columns={[
            { key: "number", label: "File No" },
            { key: "location", label: "Location" },
            { key: "createdAt", label: "Issue Date" },
            { key: "status", label: "Status" },
            { key: "district", label: "District" },
            { key: "proposal_circle", label: "Proposal Circle" },
            { key: "actions", label: "Actions" },
          ]}
          rows={7}
        />
      ) : (
        <CustomTable
          columns={[
            {
              key: "number",
              label: "File No",
              render: (file: File) => (
                <div>
                  <div className="font-medium">{file?.proposal_file_no}</div>
                  <div className="text-sm text-gray-500">
                    {file.total_floor || "N/A"}
                  </div>
                </div>
              ),
            },

            {
              key: "location",
              label: "Location",
              render: (file: File) => formatLocation(file),
            },
            {
              key: "createdAt",
              label: "Issue Date",
              render: (file: File) => formatDate(file.createdAt),
            },
            {
              key: "district",
              label: "District",
              render: (file: File) => file.district,
            },
            {
              key: "proposal_circle",
              label: "Proposal Circle",
              render: (file: File) => file.proposal_circle,
            },
            {
              key: "status",
              label: "Status",
              render: (file: File) => <StatusBadge status={file.status} />,
            },
            {
              key: "actions",
              label: "Actions",
              className: "text-center",
              render: (file: File) => (
                <div className="flex items-center justify-end gap-2">
                  {/* ISSUE / RETURN → WRITE */}
                  {can(userPermissions, "FILE", "UPDATE") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      title={
                        file.status === "available"
                          ? "Issue File"
                          : file.status === "issued"
                            ? "Return File"
                            : "Issue / Scan"
                      }
                      onClick={() => {
                        if (file.status === "available") {
                          navigate(`/files/issue/${file._id}`, {
                            state: { file },
                          });
                        } else if (file.status === "issued") {
                          navigate(`/files/return/${file._id}`, {
                            state: { file },
                          });
                        }
                      }}
                      disabled={file.status === "missing"}
                    >
                      {file.status === "available" && (
                        <MoveUpRight className="h-4 w-4" />
                      )}
                      {file.status === "issued" && (
                        <MoveDownLeft className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {/*  MISSING BUTTON (ADD HERE) */}
                  {file.status !== "missing" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      title="Mark as Missing"
                      onClick={() => {
                        setSelectedFileId(file._id); // file id save
                        setShowMissingFileModel(true); // modal open
                      }}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  )}

                  {/* VIEW → READ */}
                  {can(userPermissions, "FILE", "READ") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      title="View Details"
                      onClick={() => handleViewFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* EDIT → UPDATE */}
                  {can(userPermissions, "FILE", "UPDATE") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      title="Edit File"
                      onClick={() => handleEditFile(file)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={data?.data?.files || []}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage={error ? "Error loading files" : "No files found"}
        />
      )}

      {/* File count info */}
      <div className="text-sm text-gray-500">
        Showing {data?.data?.files?.length || 0} of {totalFiles} files
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      <MissingFileModal
        open={showMissingFileModel}
        onOpenChange={setShowMissingFileModel}
        onConfirm={handleConfirmMissing}
      />
    </div>
  );
}

export default Files;
