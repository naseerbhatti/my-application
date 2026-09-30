import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Rack",
  description = "Are you sure you want to delete this rack? This action cannot be undone.",
  loading = false,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="w-[95vw] rounded-md sm:max-w-md bg-white p-4 sm:p-6">
    
    <DialogHeader className="space-y-1">
      <DialogTitle className="text-base sm:text-lg">
        {title}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500">
        {description}
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
      
      <Button
        variant="outline"
        className="w-full sm:w-auto border border-gray-200 shadow-none"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </Button>

      <Button
        className="w-full sm:w-auto bg-red-700 text-white shadow-none hover:bg-red-800"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>

    </DialogFooter>
  </DialogContent>
</Dialog>
  );
};
