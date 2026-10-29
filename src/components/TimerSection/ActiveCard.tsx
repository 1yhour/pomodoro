import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Task, TaskInput, TaskResult } from "@/lib/tasks";
import { TaskForm } from "@/components/TaskSection/TaskForm";
import { DeleteDialog } from "@/components/TaskSection/DeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  /** The single task currently being focused on (`useTasks().activeTask`). */
  task: Task | null;
  minutesLeft: number;
  cycle: number;
  onEdit: (id: string, input: TaskInput) => Promise<TaskResult<Task>>;
  onDelete: (id: string) => Promise<boolean>;
};

export default function ActiveCard({ task, minutesLeft, cycle, onEdit, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!task) {
    return (
      <section className="flex items-center gap-2 rounded-2xl border border-dashed border-pomo-line bg-pomo-card px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-pomo-muted">No active task</p>
          <p className="mt-0.5 text-[11px] text-pomo-muted">
            Add or pick one in Tasks to focus on it.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex items-center gap-2 rounded-2xl border border-pomo-line bg-pomo-card px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm">{task.title}</p>
            <span className="shrink-0 rounded bg-pomo-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-pomo-accent">
              ACTIVE
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-pomo-muted">
            {minutesLeft}m left • <span className="text-pomo-green">{cycle}/4 pomos</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {/* Edit button */}
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label={`Edit "${task.title}"`}
            className="cursor-pointer rounded-md p-1.5 text-pomo-muted transition-colors hover:bg-pomo-raised hover:text-pomo-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pomo-accent"
          >
            <Pencil size={14} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            aria-label={`Delete "${task.title}"`}
            className="cursor-pointer rounded-md p-1.5 text-pomo-muted transition-colors hover:bg-pomo-accent-soft hover:text-pomo-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pomo-accent"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </section>

      {/* ── Edit dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[320px] gap-3 rounded-2xl border-pomo-line bg-pomo-card p-4 text-pomo-fg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Edit task</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialValues={task}
            submitLabel="Save changes"
            autoFocus
            className="border-0 p-0"
            onSubmit={(input) => onEdit(task.id, input)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <DeleteDialog
        open={deleteOpen}
        taskTitle={task.title}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          await onDelete(task.id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
