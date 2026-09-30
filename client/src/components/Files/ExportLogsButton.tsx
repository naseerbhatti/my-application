import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/drop-down";
import { Input } from "../ui/input";

function ExportLogsButton({
  onExport,
  exportloading,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  onExport: (status: string) => Promise<void> | void;
  exportloading: boolean;
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const statuses = [
    { label: "All Files", value: "all" },
    { label: "Available", value: "available" },
    { label: "Issued", value: "issued" },
    { label: "Missing", value: "missing" },
  ];

  const loading = isExporting || exportloading;

  const handleExport = async () => {
    if (loading) return;

    try {
      setIsExporting(true);

      await onExport(selectedStatus);

      setOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* TRIGGER */}
      <DropdownMenuTrigger asChild>
        <Button
          disabled={loading}
          className="bg-[#047857] hover:bg-[#065f46] text-white flex items-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export Logs</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* CONTENT */}
      <DropdownMenuContent className="w-64 p-2">
        {/* STATUS */}
        <div className="space-y-1">
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status.value}
              onSelect={(e) => {
                e.preventDefault();

                if (!loading) {
                  setSelectedStatus(status.value);
                }
              }}
              className={`cursor-pointer ${
                selectedStatus === status.value
                  ? "text-green-700 font-medium"
                  : ""
              }`}
            >
              {status.label}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* DATE FILTERS */}
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Start Date</label>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 shadow-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">End Date</label>

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 shadow-none"
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* EXPORT BUTTON */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleExport();
          }}
          disabled={loading}
          className="bg-green-50 text-green-700 hover:bg-green-100 font-medium cursor-pointer justify-center"
        >
          Export Now
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportLogsButton;
