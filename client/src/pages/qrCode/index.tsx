import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import { useApiGetFileByIdQuery } from "@/src/redux/api";
import { useParams } from "react-router-dom";

export const QrCode = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useApiGetFileByIdQuery(id || "");

  const fileNumber = data?.data?.proposal_file_no || "N/A";
  const qrCodeImage = data?.data?.qr_code || "";
  const qrCodeValue = data?.data?.qr_code_value || "";

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `QR-${fileNumber}`;
    window.print();
    // Print dialog band hone ke baad restore karo
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !qrCodeImage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Error loading QR code. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3">
      <>
        <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-print-section,
          #qr-print-section * {
            visibility: visible;
          }
          #qr-print-section {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

        <div className="px-9 lg:px-0">
          <BreadcrumbNav
            items={[
              { title: "Files", to: "/files", href: "/files" },
              { title: "View", href: `/files/${id}` },
              { title: `QR Code - ${fileNumber}` },
            ]}
          />
        </div>
        <div className="flex items-center justify-center flex-col w-full h-full">
          <div
            id="qr-print-section"
            className="w-full max-w-sm mx-auto bg-white p-6 rounded-xl shadow-md text-center space-y-4"
          >
            {/* Success Text */}
            <div className="flex items-center justify-center gap-3 w-full">
              <img
                src="/assets/auth/sbcaLogo.png"
                alt="SBCA Logo"
                width={50}
                height={49}
                className="flex-shrink-0"
              />
              <div className="flex items-start flex-col">
                <span className="text-2xl font-bold   text-emerald-700">
                  SBCA
                </span>
                <span className="text-sm text-gray-600">Library System</span>
              </div>
            </div>

            {/* QR Code Image */}
            <div className="flex flex-col items-center justify-center">
              <img
                src={qrCodeImage}
                alt="File QR Code"
                className="w-[250px] h-[250px] border-2 border-gray-200 rounded-lg p-2"
              />
              <h2 className="font-semibold text-md p-2">{qrCodeValue}</h2>
              <h2 className="font-medium text-sm ">{fileNumber}</h2>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Scan this QR code to track the file
              </p>
            </div>

            {/* Print Button */}
            <button
              // onClick={() => window.print()}
              onClick={handlePrint}
              className="no-print mt-4 w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition"
            >
              Print QR Code
            </button>
          </div>
        </div>
      </>
    </div>
  );
};
