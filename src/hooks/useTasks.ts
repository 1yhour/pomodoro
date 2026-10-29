import { useCallback, useEffect, useState } from "react";
import {
  ACTIVE_TASK_KEY,
  TASKS_STORAGE_KEY,
  addTask,
  deleteTask,
  getActiveTaskId,
  getTasks,
  setActiveTaskId,
  toggleTask,
  updateTask,
  type Task,
  type TaskInput,
  type TaskResult,
} from "@/lib/tasks";

/**
 * Subscribes to the task list and the picked focus task in
 * browser.storage.local, so every view stays in sync (including after the
 * background script or another popup edits them).
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pickedTaskId, setPickedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const [storedTasks, storedActiveId] = await Promise.all([getTasks(), getActiveTaskId()]);
      if (!active) return;
      setTasks(storedTasks);
      setPickedTaskId(storedActiveId);
      setLoading(false);
    };

    refresh();

    const onChange = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area !== "local") return;
      if (!changes[TASKS_STORAGE_KEY] && !changes[ACTIVE_TASK_KEY]) return;
      refresh();
    };

    browser.storage.onChanged.addListener(onChange);
    return () => {
      active = false;
      browser.storage.onChanged.removeListener(onChange);
    };
  }, []);

  // The picked task wins while it is still open; otherwise fall back to the
  // first unfinished task so the timer page is never empty by accident.
  const activeTask =
    tasks.find((task) => task.id === pickedTaskId && !task.isCompleted) ??
    tasks.find((task) => !task.isCompleted) ??
    null;

  const add = useCallback(
    (input: TaskInput): Promise<TaskResult<Task>> => addTask(input),
    [],
  );
  const update = useCallback(
    (id: string, input: TaskInput): Promise<TaskResult<Task>> => updateTask(id, input),
    [],
  );
  const toggle = useCallback((id: string) => toggleTask(id), []);
  const remove = useCallback((id: string) => deleteTask(id), []);

  const setActiveTask = useCallback(async (id: string | null) => {
    // Optimistic: the row highlights immediately, storage sync confirms it.
    setPickedTaskId(id);
    await setActiveTaskId(id);
  }, []);

  const completedCount = tasks.filter((task) => task.isCompleted).length;

  return {
    tasks,
    loading,
    activeTask,
    activeTaskId: activeTask?.id ?? null,
    completedCount,
    totalCount: tasks.length,
    add,
    update,
    toggle,
    remove,
    setActiveTask,
  };
}
