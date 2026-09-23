import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";

interface DeleteUserProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
}

export const DeleteUserAlert: React.FC<DeleteUserProps> = ({
  open,
  setOpen,
  onDelete,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <Alert className="w-full max-w-sm sm:max-w-md bg-white border border-gray-200 shadow-xl rounded-lg">
        <AlertTitle className="text-base sm:text-lg">Are you sure?</AlertTitle>

        <AlertDescription className="text-sm text-gray-600">
          This user will be permanently deleted. This action cannot be undone.
        </AlertDescription>

        <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
          <button
            className="
          w-full sm:w-auto
          px-4 py-2
          border border-gray-300
          rounded-md
          text-sm
          hover:bg-gray-100
          transition
        "
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>

          <button
            className="
          w-full sm:w-auto
          px-4 py-2
          bg-red-600 text-white
          rounded-md
          text-sm
          hover:bg-red-700
          transition
        "
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      </Alert>
    </div>
  );
};

export default DeleteUserAlert;
