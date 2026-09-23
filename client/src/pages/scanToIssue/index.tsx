import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

import { Section } from "@/src/components/shared/Section";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import { useApiIssueFileMutation } from "@/src/redux/api";
import { showToast } from "@/src/utils/toast";
import GenerateSlip from "@/src/components/Files/GenerateSlip";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/components/ui/combobox";

/* ---------------- Schema ---------------- */

const issueFileSchema = z.object({
  purpose: z.string().min(1, "Purpose cannot be empty"),
  requestedBy: z.string().min(1, "Requested By cannot be empty"),
  department: z.string().min(1, "Department cannot be empty"),
  description: z.string().optional(),
});

type IssueFileFormData = z.infer<typeof issueFileSchema>;

const purposeOptions = [
  { label: "Construction", value: "Construction" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Review", value: "Review" },
  { label: "Approval", value: "Approval" },
];

const departmentOptions = [
  { label: "Building Room", value: "Building Room" },
  { label: "First Floor", value: "First Floor" },
  { label: "Second Floor", value: "Second Floor" },
  { label: "Third Floor", value: "Third Floor" },
];

/* ---------------- Component ---------------- */

export const ScanToIssue = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const fileFromState = (location.state as { file?: any } | null)?.file;

  const [showGenerateSlip, setShowGenerateSlip] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);

  const [issueFile, { isLoading, isSuccess, isError, error }] =
    useApiIssueFileMutation();

  const form = useForm<IssueFileFormData>({
    resolver: zodResolver(issueFileSchema),
    defaultValues: {
      purpose: "Construction",
      department: "Building Room",
      requestedBy: "",
      description: "",
    },
  });

  const fileNumber = fileFromState?.number || id || "N/A";
  const applicantName = fileFromState?.applicant || "Unknown applicant";
  const proposalCircle = fileFromState?.proposal_circle || "N/A";
  const district = fileFromState?.district || "N/A";
  const physicalLocation = fileFromState?.shelf?.rack?.room?.number
    ? `Room-${fileFromState.shelf.rack.room.number}, Rack-${fileFromState.shelf.rack.number}, S-${fileFromState.shelf.number}`
    : "Room-01, Rack-02, S-03";
  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (isSuccess && slipData) {
      showToast("File issued successfully!", "success");
      setShowGenerateSlip(true);
    }
  }, [isSuccess, slipData]);

  useEffect(() => {
    if (isError) {
      showToast(
        (error as any)?.data?.message ||
          "Failed to issue file. Please try again.",
        "error",
      );
    }
  }, [isError, error]);

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data: IssueFileFormData) => {
    if (!id) {
      showToast("File ID is missing", "error");
      return;
    }

    try {
      await issueFile({
        id,
        data: { ...data, status: "issued" as const },
      }).unwrap();

      setSlipData({
        fileNumber,
        applicantName,
        district,
        proposalCircle,
        physicalLocation,
        ...data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="w-full max-w-7xl mx-auto p-2 space-y-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="px-9 lg:px-0">
              <BreadcrumbNav
                items={[
                  { title: "Files", href: "/files" },
                  { title: "Issue File" },
                ]}
              />
            </div>

            <Section title="Basic Information">
              <div className="grid md:grid-cols-2 gap-6">
                <Info label="File Number" value={fileNumber} />
                <Info label="Applicant Name " value={applicantName} />
                <Info label="Proposal Circle" value={proposalCircle} />
                <Info label="District" value={district} />

                {/* Purpose */}
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>

                      <Combobox items={purposeOptions.map((opt) => opt.value)}>
                        <ComboboxInput placeholder="Select purpose" />
                        <ComboboxContent>
                          <ComboboxEmpty>No items found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Physical Location */}
                <Info label="Physical Location" value={physicalLocation} />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Combobox
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <ComboboxInput placeholder="Select or type department" />
                        <ComboboxContent>
                          <ComboboxList className={""}>
                            {departmentOptions.map((option) => (
                              <ComboboxItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Requested By */}
                <FormField
                  control={form.control}
                  name="requestedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested By</FormLabel>
                      <FormControl className="border-gray-200">
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            <Section title="Remarks (Optional)">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Add any notes..."
                        {...field}
                        className="border border-gary-200 shadow-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Section>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                // className="px-8 py-2.5 bg-[#047857] text-white rounded-lg"
                className="w-full sm:w-auto active:scale-95
   disabled:opacity-70 disabled:cursor-not-allowed px-6 py-2.5 bg-[#047857] hover:bg-teal-700  text-white font-semibold rounded-lg transition flex items-center gap-2"
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isLoading ? "Issuing..." : "Issue File & Generate Slip"}
              </Button>
            </div>
          </form>
        </Form>

        {slipData && (
          <GenerateSlip
            open={showGenerateSlip}
            setOpen={setShowGenerateSlip}
            selectedFile={slipData}
            fileId={id || ""}
          />
        )}
      </div>
    </div>
  );
};

export default ScanToIssue;

/* ---------------- Small Helper ---------------- */
const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground uppercase">
      {label}
    </p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);
