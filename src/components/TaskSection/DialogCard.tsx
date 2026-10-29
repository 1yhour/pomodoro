import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskSection/TaskForm";
import { useTasks } from "@/hooks/useTasks";

/** Header "+ New" button that opens the add-task form in a dialog. */
export default function DialogCard() {
  const { add } = useTasks();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto flex cursor-pointer items-center gap-1 rounded-lg bg-pomo-raised px-2.5 py-1.5 text-xs text-pomo-muted hover:text-pomo-fg"
      >
        <Plus size={14} /> New
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[320px] gap-3 rounded-2xl border-pomo-line bg-pomo-card p-4 text-pomo-fg">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-semibold">New task</DialogTitle>
            <DialogDescription className="text-[11px] text-pomo-muted">
              Add something to focus on next.
            </DialogDescription>
          </DialogHeader>

          <TaskForm
            onSubmit={async (input) => {
              const result = await add(input);
              if (result.ok) setOpen(false);
              return result;
            }}
            submitLabel="Add task"
            onCancel={() => setOpen(false)}
            autoFocus
            className="border-0 bg-transparent p-0"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
