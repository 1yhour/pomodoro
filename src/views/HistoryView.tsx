import { TaskItem } from "@/components/TaskSection/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { DeleteDialog } from "@/components/TaskSection/DeleteDialog";
import { useTaskDialogs } from "@/hooks/useTaskDialog";
import EditTaskDialog from "@/components/TaskSection/DialogEdit";
export function HistoryView() {
  const { tasks, toggle } = useTasks();
  const {
    handleConfirmDelete,
    handleUpdate,
    openEdit,
    closeDelete,
    closeEdit,
    openDelete,
    deleting,
    editing,
  } = useTaskDialogs();
  const completed = tasks
    .filter((task) => task.isCompleted)
    .sort((a, b) => ((b.completedAt ?? 0) > (a.completedAt ?? 0) ? 1 : -1));
  return (
    <>
      {completed.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-pomo-muted">
          No completed tasks yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {completed.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isActive={false}
              onToggle={toggle}
              onFocus={() => {}}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </ul>
      )}
      <DeleteDialog
        open={deleting !== null}
        taskTitle={deleting?.title ?? ""}
        onOpenChange={(open) => {
          if (!open) closeDelete;
        }}
        onConfirm={handleConfirmDelete}
      />
      <EditTaskDialog
        task={editing}
        onSubmit={handleUpdate}
        onClose={closeEdit}
      />
    </>
  );
}
