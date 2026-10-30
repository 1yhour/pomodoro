import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/lib/tasks";
import type { ComponentProps } from "react";
type EditTaskDialogProps = {
  task: Task | null;
  onSubmit: ComponentProps<typeof TaskForm>["onSubmit"];
  onClose: () => void;
};
export default function EditTaskDialog({
  task,
  onSubmit,
  onClose,
}: EditTaskDialogProps) {
  return (
    <Dialog
      open={task !== null}
      onOpenChange={(open) => {
        if (!open) onClose;
      }}
    >
      <DialogContent className="max-w-[320px] gap-3 rounded-2xl border-pomo-line bg-pomo-card p-4 text-pomo-fg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold">Edit task</DialogTitle>
          <DialogDescription className="text-[11px] text-pomo-muted">
            Update the title, length or description.
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          initialValues={task}
          onSubmit={onSubmit}
          submitLabel="Save changes"
          onCancel={onClose}
          autoFocus
          className="border-0 bg-transparent p-0"
        />
      </DialogContent>
    </Dialog>
  );
}
