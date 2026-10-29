import { Play } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

type FocusTaskProps = {
  /** The single task currently being focused on (`useTasks().activeTask`). */
  task: Task | null;
};

export default function FocusTask({ task }: FocusTaskProps) {
  return (
    <div className="flex max-w-full truncate items-center gap-1 text-xs text-pomo-muted mt-5">
      <div className="flex shrink-0 items-center gap-1 text-pomo-accent opacity-70">
        <Play size={12} />Focusing on:
      </div>
      <span
        className={cn("ml-1 truncate break-all", task ? "text-pomo-fg max-w-[250px]" : "text-pomo-muted opacity-70")}
        title={task?.title}
      >
        {task ? task.title : "No task selected"}
      </span>
    </div>
  );
}
