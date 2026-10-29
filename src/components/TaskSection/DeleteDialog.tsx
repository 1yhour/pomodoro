import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteDialogProps = {
  open: boolean;
  taskTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteDialog({ open, taskTitle, onOpenChange, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (deleting) return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (deleting ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-[300px] gap-3 rounded-2xl border-pomo-line bg-pomo-card p-4 text-pomo-fg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold">Delete task?</DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed text-pomo-muted">
            <span className="text-pomo-fg">“{taskTitle}”</span> will be removed permanently.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-8 bg-pomo-raised text-xs text-pomo-muted hover:bg-pomo-raised/70 hover:text-pomo-fg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={deleting}
            className="h-8 bg-pomo-accent text-xs font-semibold text-white hover:brightness-110"
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
