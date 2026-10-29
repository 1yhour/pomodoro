import { useState } from "react";
import { DeleteDialog } from "@/components/TaskSection/DeleteDialog";
import { TaskForm } from "@/components/TaskSection/TaskForm";
import { TaskItem } from "@/components/TaskSection/TaskItem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";
import type { Task, TaskInput, TaskResult } from "@/lib/tasks";

export function TasksView() {
  const {
    tasks,
    loading,
    add,
    update,
    toggle,
    remove,
    activeTask,
    setActiveTask,
    completedCount,
    totalCount,
  } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  async function handleUpdate(input: TaskInput): Promise<TaskResult<Task>> {
    if (!editing) return { ok: false, errors: { form: "No task selected." } };

    const result = await update(editing.id, input);
    if (result.ok) setEditing(null);
    return result;
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <TaskForm onSubmit={add} submitLabel="Add task" autoFocus />

      <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-[0.2em] text-pomo-muted">
        <span>Tasks</span>
        <span>
          {completedCount}/{totalCount} done
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-xs text-pomo-muted">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pomo-line px-4 py-10 text-center">
          <p className="text-sm text-pomo-fg">No tasks yet</p>
          <p className="mt-1 text-xs text-pomo-muted">
            Add one above to attach it to a focus session.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isActive={task.id === activeTask?.id}
              onToggle={toggle}
              onFocus={(picked) => setActiveTask(picked.id)}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
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
            initialValues={editing}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            autoFocus
            className="border-0 bg-transparent p-0"
          />
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleting !== null}
        taskTitle={deleting?.title ?? ""}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
