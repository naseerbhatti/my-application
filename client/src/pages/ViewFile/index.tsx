import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  Edit,
  Copy,
  QrCode as QrCodeIcon,
  Upload,
  ChevronRight,
} from "lucide-react";
import { useApiGetFileByIdQuery } from "@/src/redux/api";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import { Section } from "@/src/components/shared/Section";
import CustomTable from "@/src/components/shared/CustomTable";
import ViewFileHistoryDialog from "@/src/components/Files/ViewFileHistoryDialog";
import { BreadcrumbSeparator } from "@/src/components/ui/breadcrumb";
import { Card } from "@/src/components/ui/card";
import { Feild } from "@/src/components/shared/Field";
import { Button } from "@/src/components/ui/button";

interface FileHistoryItem {
  _id: string;
  purpose: string;
  date: string;
  action: string;
  status: string;
  new_location: string;
  previous_location: string;
  department: string;
  return_condition?: string;
  issue_slip?: string;
  performed_by: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  createDate: string;
}

export const ViewFile = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedHistory, setSelectedHistory] =
    useState<FileHistoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fileFromState = (location.state as { file?: any } | null)?.file;
  const { data, isLoading } = useApiGetFileByIdQuery(id || "");

  const fileNumber = data?.data?.number || id || "N/A";
  const fileData = data?.data || {};
  const lastScanned = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString()
    : "Not scanned yet";
  const fileHistory = data?.data?.transactions || [];

  const fileInfo = useMemo(
    () => ({
      applicantName: data?.data?.applicant || "Unknown applicant",
      id: data?._id || id || "N/A",
      contact: data?.contact || "N/A",
      phone: data?.phone || "N/A",
      subject: data?.description || "No subject provided",
    }),
    [data, id],
  );

  const currentLocation = {
    name: data?.data?.shelf?.rack?.room?.house?.name || "Unknown house",
    room: data?.data?.shelf?.rack?.room?.number
      ? `Room-${data?.data.shelf.rack.room.number}`
      : "Room-?",
    rack: data?.data?.shelf?.rack?.number
      ? `Rack-${data?.data.shelf.rack.number}`
      : "Rack-?",
    shelf: data?.data?.shelf?.number
      ? `Shelf-${data?.data.shelf.number}`
      : "Shelf-?",
  };

  const handleViewHistory = (history: FileHistoryItem) => {
    setSelectedHistory(history);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedHistory(null);
  };

  const handleViewFile = () => {
    navigate(`/files/edit/${id}`);
  };

  const handleGenerateQR = () => {
    navigate(`/files/${id}/qrcode`);
  };

  return (
    <div className="p-2  space-y-3 ">
      <div className="w-full mx-auto  space-y-6">
        <div className="px-9 lg:px-0">
          <BreadcrumbNav
            items={[
              // <ChevronRight className="h-4 w-4 text-gray-400" />,

              { title: "Files", href: "/files" },
              { title: "View", href: `/files/${id}` },
            ]}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Section */}
            <Card className="p-4 shadow-none">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Information
                </h2>

                <Button className="bg-[#047857] hover:bg-[#065f46] " onClick={handleViewFile}>Edit File</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <Feild
                  label="Proposal no"
                  value={fileData?.proposal_file_no || "Not specified"}
                />
                <Feild
                  label="Covered Area"
                  value={fileData?.covered_area || "Not specified"}
                />
                <Feild
                  label="Plot Area"
                  value={fileData?.plot_area || "Not specified"}
                />
                <Feild
                  label="Total Floors"
                  value={fileData?.total_floor || "Not specified"}
                />
                <Feild
                  label="Property Address"
                  value={fileData?.property_address || "Not specified"}
                />
                <Feild
                  label="District "
                  value={fileData?.district || "Not specified"}
                />
                <Feild
                  label="Proposal Circle"
                  value={fileData?.proposal_circle || "Not specified"}
                />
                <Feild
                  label="Owner Name"
                  value={fileData?.owners || "Not specified"}
                />
                <Feild
                  label="Current Status"
                  value={
                    fileData?.status
                      ? fileData.status.charAt(0).toUpperCase() +
                        fileData.status.slice(1).toLowerCase()
                      : "Not specified"
                  }
                />
              </div>
            </Card>

            {/* File History Section */}
            <Section title="File History">
              <div className="max-h-[400px] overflow-y-auto overflow-x-auto border rounded-md">
                <CustomTable
                  columns={[
                    {
                      key: "purpose",
                      label: "Purpose",
                      render: (row: FileHistoryItem) => (
                        <span className="text-gray-900 font-medium">
                          {row.purpose}
                        </span>
                      ),
                    },
                    {
                      key: "date",
                      label: "Issue Date",
                      render: (row: FileHistoryItem) => (
                        <span className="text-gray-600">
                          {data?.data?.createdAt
                            ? new Date(data.data.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Date Not Found"}
                        </span>
                      ),
                    },
                    {
                      key: "performed_by",
                      label: "Performed By",
                      render: (row: FileHistoryItem) => (
                        <div>
                          <p className="font-medium text-gray-900">
                            {row.performed_by?.name
                              ?.split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (row: FileHistoryItem) => (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewHistory(row)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  data={fileHistory}
                  isLoading={isLoading}
                  emptyMessage="No history available for this file"
                />
              </div>
            </Section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Current Location */}
            <Section title="Current Location">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-14 h-14 bg-white border border-gray-300 rounded flex items-center justify-center">
                    <span className="text-3xl">📍</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-1">
                      {currentLocation.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentLocation.room}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentLocation.rack} / {currentLocation.shelf}
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Actions */}
            <Section title="Actions">
              <div className="space-y-3">
                <button
                  onClick={handleGenerateQR}
                  className="w-full py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-base"
                >
                  <QrCodeIcon size={20} />
                  Generate QR Code
                </button>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* History Details Dialog */}
      <ViewFileHistoryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        history={selectedHistory}
        fileCreatedAt={data?.data?.createdAt}
      />
    </div>
  );
};

export default ViewFile;
