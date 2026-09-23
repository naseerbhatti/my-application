import React from "react";
import { useNavigate } from "react-router-dom";

interface GenerateSlipProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedFile: {
    fileNumber: string;
    applicantName: string;
    physicalLocation: string;
    purpose: string;
    department: string;
    district: string;
    proposalCircle: string;
    requestedBy: string;
    description?: string;
  };
  fileId: string;
}

function GenerateSlip({
  open,
  setOpen,
  selectedFile,
  fileId,
}: GenerateSlipProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setOpen(false);
    navigate(`/files/${fileId}`);
  };

  if (!open) return null;

  return (
    <>
      {open && selectedFile && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/90 p-3">
          <div className="bg-white w-full max-w-[450px] sm:max-w-[500px] rounded-lg shadow-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <img
                src="/assets/auth/sbcaLogo.png"
                alt="Logo"
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-2"
              />

              <h2 className="font-bold text-base sm:text-lg">
                Sindh Building Control Authority
              </h2>

              <p className="text-[10px] sm:text-xs text-gray-600 leading-snug">
                V3XF+X36, Civic Center, University Road, Pakistan,
                <br />
                Block 14 Gulshan-e-Iqbal, Karachi. (021) 99230329
              </p>

              <p className="mt-2 font-semibold text-sm sm:text-base">
                File Issue Slip
              </p>

              <p className="text-[10px] sm:text-xs text-gray-500">
                File has been issued successfully
              </p>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-gray-600">FILE NUMBER</p>
                <p className="text-gray-900 break-words">
                  {selectedFile.fileNumber}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">APPLICANT NAME</p>
                <p className="text-gray-900 break-words">
                  {selectedFile.applicantName}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Issue Date</p>
                <p className="text-gray-900">
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Requested By</p>
                <p className="text-gray-900">{selectedFile.requestedBy}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Department</p>
                <p className="text-gray-900">{selectedFile.department}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Physical Location</p>
                <p className="text-gray-900">{selectedFile.physicalLocation}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">District</p>
                <p className="text-gray-900">
                  {selectedFile.district || "N/A"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Proposal Circle</p>
                <p className="text-gray-900">
                  {selectedFile.proposalCircle || "N/A"}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="font-semibold text-gray-600">Request Purpose</p>
                <p className="text-gray-900">{selectedFile.purpose}</p>
              </div>

              {selectedFile.description && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="font-semibold text-gray-600">Remarks</p>
                  <p className="text-gray-900 text-xs">
                    {selectedFile.description}
                  </p>
                </div>
              )}

              <div className="col-span-1 sm:col-span-2 mt-2 sm:mt-4">
                <p className="font-semibold text-gray-600 mb-2">
                  Signature of Requestor
                </p>
                <div className="border-t border-gray-400 pt-1"></div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6 no-print">
              <button
                onClick={handlePrint}
                className="w-full sm:w-32 h-10 text-white bg-[#047857] hover:bg-[#036146] rounded-lg font-medium transition"
              >
                Print
              </button>

              <button
                onClick={handleClose}
                className="w-full sm:w-32 h-10 text-[#667085] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Close
              </button>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img
                src="/assets/auth/sbcaLogo.png"
                alt="Watermark"
                className="w-32 sm:w-48 h-32 sm:h-48 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GenerateSlip;
