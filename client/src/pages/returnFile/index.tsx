import React, { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, AlertCircle, PackageCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/src/utils/toast";
import {
  useApiGetFileByIdQuery,
  useApiReturnFileMutation,
} from "@/src/redux/api";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";

// Zod validation schema
const returnFileSchema = z.object({
  return_condition: z.enum(["good", "damaged", "incomplete"], {
    message: "Return condition is required",
  }),
  remarks: z.string().optional(),
});

type ReturnFileFormData = z.infer<typeof returnFileSchema>;

function ReturnFile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fileFromState = (location.state as { file?: any } | null)?.file;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReturnFileFormData>({
    resolver: zodResolver(returnFileSchema),
    defaultValues: {
      return_condition: "good",
      remarks: "",
    },
  });
  const { data: response } = useApiGetFileByIdQuery(id!, { skip: !id });
  const fileData = response?.data;

  const fileNumber = fileData?.number || id || "N/A";
  const applicantName = fileData?.applicant || "Unknown applicant";
  const houseName =
    fileData?.shelf?.rack?.room?.house?.name || "Archive Building";
  const roomNumber = fileData?.shelf?.rack?.room?.number || "01";
  const rackNumber = fileData?.shelf?.rack?.number || "02";
  const shelfNumber = fileData?.shelf?.number || "01";

  const [returnFile, { isLoading, isSuccess, isError, error }] =
    useApiReturnFileMutation();

  useEffect(() => {
    if (isSuccess) {
      showToast("File returned successfully!", "success");
      navigate("/files");
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      const errorMessage =
        (error as any)?.data?.message ||
        "Failed to return file. Please try again.";
      showToast(errorMessage, "error");
    }
  }, [isError, error]);

  const onSubmit = async (data: ReturnFileFormData) => {
    if (!id) {
      showToast("File ID is missing", "error");
      return;
    }
    try {
      await returnFile({
        id,
        data: {
          return_condition: data.return_condition,
          remarks: data.remarks,
        },
      }).unwrap();
    } catch (err) {
      console.error("Error returning file:", err);
    }
  };

  const handlefieLocation = () => {
    navigate(`/files/edit/${id}`)
  }


    return (
 <div className="p-2 space-y-3 bg-gray-50">
  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="w-full mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className=" px-9 lg:px-0 overflow-x-auto">
        <BreadcrumbNav
          items={[
            { title: "Files ", href: "/files" },
            {
              title: `Return File - ${fileNumber}`,
              href: `/files/return/${id}`,
            },
          ]}
        />
      </div>

      {/* Assigned Placement Location */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-2 text-amber-800 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Assigned Placement Location:</span>
        </div>

        <div className="flex flex-wrap justify-center  gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-amber-900 mb-6">
          <span>{houseName}</span>
          <ChevronRight className="text-amber-600" size={20} />
          <span>Room-{roomNumber}</span>
          <ChevronRight className="text-amber-600" size={20} />
          <span>R-{rackNumber}</span>
          <ChevronRight className="text-amber-600" size={20} />
          <span>S-{shelfNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center  gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlefieLocation}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change the file location
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            {isLoading ? "Processing..." : "same location"}
          </button>
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <PackageCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-800">
          <span className="font-semibold block">File is being returned</span>
          <span className="block font-medium">
            Please verify the file condition before confirming return
          </span>
        </div>
      </div>
    </div>
  </form>
</div>
  
  )
}

export default ReturnFile;