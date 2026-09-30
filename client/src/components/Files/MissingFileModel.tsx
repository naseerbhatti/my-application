import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface MissingFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const MissingFileModal = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: MissingFileModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] rounded-md sm:max-w-md bg-white p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base sm:text-lg">
            Mark File as Missing
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Are you sure you want to mark this file as missing? You can update
            it later if found.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto border border-gray-200 shadow-none"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white shadow-none "
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Updating..." : "Mark as Missing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
