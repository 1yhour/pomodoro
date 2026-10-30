import type { Task, TaskInput, TaskResult } from "@/lib/tasks";
import { useTasks } from "./useTasks";
export function useTaskDialogs(){
    const {update, remove} = useTasks();
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
    return{
        editing,
        deleting,
        openDelete: setDeleting,
        openEdit: setEditing,
        closeDelete: ()=>setDeleting(null),
        closeEdit: ()=>setEditing(null),
        handleConfirmDelete,
        handleUpdate
    }
}
export type TaskDialogsState = ReturnType<typeof useTaskDialogs>;