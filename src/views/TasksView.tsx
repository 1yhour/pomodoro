import { DeleteDialog } from "@/components/TaskSection/DeleteDialog";
import { TaskForm } from "@/components/TaskSection/TaskForm";
import { TaskItem } from "@/components/TaskSection/TaskItem";
import EditTaskDialog from "@/components/TaskSection/DialogEdit";
import { useTasks } from "@/hooks/useTasks";
import { useTaskDialogs } from "@/hooks/useTaskDialog";

export function TasksView() {
  const {
    tasks,
    loading,
    add,
    toggle,
    activeTask,
    setActiveTask,
    completedCount,
    totalCount,
  } = useTasks();
  const {handleConfirmDelete, handleUpdate, openEdit, closeDelete ,closeEdit, openDelete, deleting ,editing} =useTaskDialogs();
  const completed = tasks.filter((task)=>task.isCompleted);
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
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </ul>
      )}
      <EditTaskDialog
        task={editing}
        onSubmit={handleUpdate}
        onClose={closeEdit}
      />

      <DeleteDialog
        open={deleting !== null}
        taskTitle={deleting?.title ?? ""}
        onOpenChange={(open) => {
          if (!open) closeDelete;
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
