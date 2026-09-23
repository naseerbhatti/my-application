import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { uploadImagesToCloudinary } from "@/src/utils/UploadImage";
import {
  useApiAddFileSlipMutation,
  useLazyApiGetSignedUrlQuery,
  useApiUpdateFileSlipMutation,
} from "@/src/redux/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, Pencil, X, Check, Download } from "lucide-react";
import { showToast } from "@/src/utils/toast";

const fileSlipSchema = z.object({
  image: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Image is required",
  }),
});

type FileSlipFormData = z.infer<typeof fileSlipSchema>;

interface FileHistoryItem {
  _id: string;
  purpose: string;
  date: string;
  previous_location: string;
  new_location: string;
  action: string;
  status: string;
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
}

interface ViewFileHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: FileHistoryItem | null;
  fileCreatedAt?: string;
}

function ViewFileHistoryDialog({
  isOpen,
  onClose,
  history,
  fileCreatedAt,
}: ViewFileHistoryDialogProps) {
  const [addSlip] = useApiAddFileSlipMutation();
  const [getSignedUrl] = useLazyApiGetSignedUrlQuery();
  const [updateSlip] = useApiUpdateFileSlipMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSlip, setCurrentSlip] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FileSlipFormData>({
    resolver: zodResolver(fileSlipSchema),
  });

  // Watch for file changes to show preview
  const watchImage = watch("image");

  React.useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];

      // ✅ use object URL instead of base64
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // cleanup (IMPORTANT)
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [watchImage]);

  const onSubmit = async (data: FileSlipFormData) => {
    try {
      setIsLoading(true);

      const imageFiles = Array.from(data.image);

      // Get signed URLs
      const { data: signedData } = await getSignedUrl({
        folder: "fileSlips",
        count: imageFiles.length,
      });

      if (!signedData) {
        throw new Error("Failed to get signed URLs");
      }

      // Upload images to Cloudinary
      const uploadedImageUrls = await uploadImagesToCloudinary(
        imageFiles,
        async (count: number) => signedData,
      );

      if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
        throw new Error("Failed to upload images");
      }

      // Submit to API
      await addSlip({
        id: history?._id || "",
        image: uploadedImageUrls[0], // Using first image
      }).unwrap();

      showToast("Slip image uploaded successfully", "success");
      reset();
      setPreviewUrl(null);
      onClose();
    } catch (error: any) {
      console.error("Error uploading slip:", error);
      showToast(error?.message || "Failed to upload slip image", "error");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen && history?.issue_slip) {
      setCurrentSlip(history.issue_slip);
    }
    // Reset edit mode when dialog opens/closes
    if (!isOpen) {
      setEditMode(false);
      setEditFile(null);
      setEditPreviewUrl(null);
      setCurrentSlip(null);
    }
  }, [history, isOpen]);

  const handleEditSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditPreviewUrl(reader.result as string);
      setEditMode(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const handleUpdateSlip = async () => {
    if (!editFile) return;

    try {
      setIsLoading(true);

      // Get signed URL
      const { data: signedData } = await getSignedUrl({
        folder: "fileSlips",
        count: 1,
      });

      if (!signedData) throw new Error("Failed to get signed URL");

      // Upload to Cloudinary
      const [uploadedUrl] = await uploadImagesToCloudinary(
        [editFile],
        async () => signedData,
      );

      if (!uploadedUrl) throw new Error("Upload failed");

      // Update via API
      if (!history) {
        throw new Error("History is not available");
      }
      await updateSlip({
        id: history._id,
        issue_slip: uploadedUrl,
      }).unwrap();

      setCurrentSlip(uploadedUrl);
      setEditMode(false);
      setEditFile(null);
      setEditPreviewUrl(null);

      showToast("Slip updated successfully", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Failed to update slip", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const checkIsPdf = (url: string | null): boolean => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0]; // query params hatao
    return cleanUrl.toLowerCase().endsWith(".pdf");
  };

  const handleDownloadSlip = async () => {
    if (!currentSlip) return;
    try {
      const response = await fetch(currentSlip);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `issue-slip-${history?._id || "unknown"}.${blob.type.split("/")[1] || "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      showToast("Image downloaded successfully", "success");
    } catch (error) {
      console.error("Download failed:", error);
      showToast("Failed to download image", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {history && (
          <div className="space-y-6 ">
            {/* Performed By Section */}
            <div className="  rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Performed By
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {history?.performed_by?.name
                      ?.split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {history?.performed_by?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {history?.performed_by?.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Issue Date:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {" "}
                    {fileCreatedAt ? (
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {new Date(fileCreatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      "Date Not Found"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Last Update Date:
                  </span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {new Date(history.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">
                Transaction Information
              </h3>

              {/* Row: Department + Purpose */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>

                  <p className="text-xs font-medium text-gray-900">
                    {history.new_location
                      ? history.previous_location
                        ? `${history.previous_location} → ${history.new_location}`
                        : history.new_location
                      : history.previous_location || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Purpose</p>
                  <p className="text-xs text-gray-900">{history.purpose}</p>
                </div>
              </div>

              {/* Return Condition - full width */}
              {history.return_condition && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Return Condition
                  </h3>
                  <p className="text-xs text-gray-900">
                    {history.return_condition}
                  </p>
                </div>
              )}
            </div>
            {/* Issue Slip Upload Form */}
            {!history.issue_slip && history.action === "issue" && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                  Upload Issue Slip
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slip Image
                    </label>

                    <div className="flex items-center gap-4">
                      {/* Upload Button */}
                      <label
                        htmlFor="slip-image"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Choose File</span>
                      </label>

                      {/* Hidden Input */}
                      <input
                        id="slip-image"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        {...register("image")}
                      />

                      {/* File Name */}
                      {watchImage && watchImage.length > 0 && (
                        <span className="text-sm text-gray-600 truncate max-w-[180px]">
                          {watchImage[0].name}
                        </span>
                      )}
                    </div>

                    {/* Error */}
                    {errors.image && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.image.message}
                      </p>
                    )}

                    {/* Preview Section */}
                    {watchImage && watchImage.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Preview:
                        </p>

                        {watchImage[0].type === "application/pdf" ? (
                          //  PDF Preview (No iframe → no scroll)
                          <div
                            onClick={() =>
                              previewUrl && window.open(previewUrl, "_blank")
                            }
                            className="relative w-56 h-32 rounded-lg border bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition"
                          >
                            <span className="text-xl">📄</span>
                            <span className="text-sm font-medium text-gray-700">
                              PDF Selected
                            </span>
                            <span className="text-xs text-gray-500">
                              Click to view
                            </span>
                          </div>
                        ) : (
                          // ✅ Image Preview
                          <img
                            src={previewUrl || "/placeholder.png"}
                            alt="Preview"
                            className="w-56 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Slip"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {history.issue_slip && (
              <div className="border-t pt-4 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Issue Slip
                  </h3>
                  {editMode && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateSlip}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex shadow-none items-center gap-2"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {!editMode ? (
                  // Normal view mode
                  <div className="relative inline-block group">
                    {checkIsPdf(currentSlip) ? (
                      // ✅ PDF Thumbnail (NO iframe → no scroll issue)
                      <div
                        onClick={() => window.open(currentSlip!, "_blank")}
                        className="w-48 h-32 rounded-lg border bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition"
                      >
                        <span className="text-lg">📄</span>
                        <span className="text-sm font-medium text-gray-700">
                          View PDF
                        </span>
                        <span className="text-xs text-gray-500">
                          Click to open
                        </span>
                      </div>
                    ) : (
                      // ✅ Image Preview
                      <img
                        onClick={() => window.open(currentSlip!, "_blank")}
                        src={currentSlip || "/placeholder.png"}
                        alt="Issue Slip"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                      />
                    )}

                    {/* ✅ Hover Action Icons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {/* Download */}
                      <button
                        onClick={handleDownloadSlip}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-700" />
                      </button>

                      {/* Edit */}
                      <label
                        htmlFor={`edit-slip-${history._id}`}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-gray-700" />
                      </label>
                    </div>

                    {/* Hidden Input */}
                    <input
                      id={`edit-slip-${history._id}`}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleEditSlip}
                    />
                  </div>
                ) : (
                  // Edit mode with preview
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Current Image */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current:</p>
                        <img
                          src={currentSlip || "/placeholder.png"}
                          alt="Current Slip"
                          className="w-56 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      {/* New preview in edit mode */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">New:</p>
                        {editFile?.type === "application/pdf" ? (
                          <iframe
                            src={editPreviewUrl || ""}
                            className="w-56 h-32 rounded-lg border border-gray-200"
                            title="New Slip Preview"
                          />
                        ) : (
                          <img
                            src={editPreviewUrl || "/placeholder.png"}
                            alt="New Slip Preview"
                            className="w-56 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ViewFileHistoryDialog;
