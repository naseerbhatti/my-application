import { FilesTrendChart } from "@/src/components/dashboard/FilesTrendChart";
import { RackCapacityChart } from "@/src/components/dashboard/RackCapacityChart";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import StatsGroup from "@/src/components/shared/StatsGroup";
import { useApiGetDashboardStatsQuery } from "@/src/redux/api";
import CustomTable from "@/src/components/shared/CustomTable";
import { Button } from "@base-ui/react";
import { Eye, MoveDownLeft, MoveUpRight, Pencil } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { useState } from "react";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { useNavigate } from "react-router-dom";
import { can } from "@/src/utils/permisson";
import { useSelector } from "react-redux";
import StatsGroupSkeleton from "@/src/components/Skeleton/StatsGroupSkeleton";
import { FilesTrendChartSkeleton } from "@/src/components/Skeleton/FilesTrendChartSkeleton";
import { RackCapacityChartSkeleton } from "@/src/components/Skeleton/RackCapacityChartSkeleton";
import { CustomTableSkeleton } from "@/src/components/Skeleton/CustomTableSkeleton";

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
  district?: string;
  proposal_circle: string;
  plan_type?: string;
  number: string;
  applicant: string;
  shelf: Shelf;
  status: "issued" | "available" | "missing";
  createdAt: string;
  description?: string;
}

function Dashboard() {
  const { data: dashboardStats, isLoading } = useApiGetDashboardStatsQuery();
  const data = dashboardStats?.data;

  const { user } = useSelector((state: any) => state.auth);

  const userPermissions = user?.permissions || {};
  const navigate = useNavigate();
  const formatLocation = (file: File) => {
    if (!file.shelf) return "N/A";

    const roomName = file.shelf?.rack?.number ?? "N/A";

    const shelfNo = file.shelf?.number ?? "?";

    return (
      <div className="flex gap-1">
        <Badge variant="outline" className="bg-green-50 text-green-700 ">
          R-{roomName}
        </Badge>

        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          S-{shelfNo}
        </Badge>
      </div>
    );
  };

  const userdata = dashboardStats?.data;

  const filedata = userdata?.currentWeek;

  const recentFiles = userdata?.getRecentFile || [];

  const capacityData = userdata?.currentMonth
    ? [
        { name: "TotalFile", value: userdata.totalFile },
        { name: "IssuedFile", value: userdata.issueFile },
        { name: "AvailableFile", value: userdata.availableFile },
        { name: "MissingFile", value: userdata.missingFile },
      ]
    : [];

  const formattedDated = filedata?.map((item: any) => ({
    day: item.day ? item.day.slice(0, 3) : "",
    newFiles: item.newFiles ?? 0,
    issued: item.issued ?? 0,
    returned: item.returned ?? 0,
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-2   space-y-3">
      <div className=" flex items-center justify-between">
        <div className="px-9  lg:px-0">
          <BreadcrumbNav items={[{ title: "Dashboard" }]} />
        </div>
      </div>

      {isLoading ? (
        <StatsGroupSkeleton />
      ) : (
        <StatsGroup
          stats={[
            {
              label: "Total Files",
              value: userdata?.totalFile ?? 0,
            },
            {
              label: "Issue Files",
              value: userdata?.issueFile ?? 0,
            },
            {
              label: "Available Files",
              value: userdata?.availableFile ?? 0,
            },
            {
              label: "Missing Files",
              value: userdata?.missingFile ?? 0,
            },
          ]}
        />
      )}

      <div className="flex  w-full md:flex-row flex-col items-center gap-6 justify-between">
        {isLoading ? (
          <FilesTrendChartSkeleton />
        ) : (
          <FilesTrendChart formattedDated={formattedDated || []} />
        )}
        {isLoading ? (
          <RackCapacityChartSkeleton />
        ) : (
          <RackCapacityChart capacityData={capacityData || []} />
        )}
      </div>

      {isLoading ? (
        <CustomTableSkeleton
          columns={[
            { key: "number", label: "File No" },
            { key: "location", label: "Location" },
            { key: "createdAt", label: "Issue Date" },
            { key: "district", label: "District" },
            { key: "proposal_circle", label: "Proposal Circle" },
            { key: "status", label: "Status" },
          ]}
          rows={5}
        />
      ) : (
        
        <CustomTable
          data={recentFiles}
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
          ]}
        />
      )}
    </div>
  );
}

export default Dashboard;
