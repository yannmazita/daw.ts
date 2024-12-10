// src/features/patterns/components/DeletePatternDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/shadcn/ui/dialog";
import { Button } from "@/common/shadcn/ui/button";

interface DeletePatternDialogProps {
  patternId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePatternDialog: React.FC<DeletePatternDialogProps> = ({
  patternId,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!patternId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pattern</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the pattern? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
