import { Clock, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export type TaskItemProps = {
  task: Task;
  isActive: boolean;
  onToggle: (id: string) => void;
  onFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskItem({
  task,
  isActive,
  onToggle,
  onFocus,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <li
      className={cn(
        "group flex items-start gap-2.5 rounded-xl border bg-pomo-card px-3 py-2.5 transition-colors",
        isActive ? "border-pomo-accent/60 bg-pomo-accent-soft/25" : "border-pomo-line",
        task.isCompleted && "opacity-70",
      )}
    >
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={task.isCompleted ? `Mark "${task.title}" as active` : `Complete "${task.title}"`}
        className="mt-0.5 size-4 rounded border-pomo-line data-[state=checked]:border-pomo-green data-[state=checked]:bg-pomo-green data-[state=checked]:text-pomo-bg"
      />

      <button
        type="button"
        onClick={() => onFocus(task)}
        disabled={task.isCompleted}
        aria-pressed={isActive}
        title={
          task.isCompleted
            ? "Completed tasks can't be focused"
            : isActive
              ? "This is your focus task"
              : `Focus on "${task.title}"`
        }
        className="min-w-0 flex-1 cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pomo-accent disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm text-pomo-fg",
              task.isCompleted && "text-pomo-muted line-through",
            )}
          >
            {task.title}
          </p>
          {isActive && (
            <span className="shrink-0 rounded bg-pomo-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-pomo-accent">
              ACTIVE
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-pomo-muted">
          <Clock size={10} className="shrink-0" />
          <span className="shrink-0">{task.duration}m</span>
          {task.description && (
            <>
              <span aria-hidden>•</span>
              <span className="truncate">{task.description}</span>
            </>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="cursor-pointer rounded-md p-1.5 text-pomo-muted transition-colors hover:bg-pomo-raised hover:text-pomo-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pomo-accent"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="cursor-pointer rounded-md p-1.5 text-pomo-muted transition-colors hover:bg-pomo-accent-soft hover:text-pomo-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pomo-accent"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
