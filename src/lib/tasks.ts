/**
 * Task model, input validation and storage-backed CRUD.
 *
 * Tasks live in browser.storage.local (key: "tasks") for the same reason the
 * timer does: the popup unmounts every time it closes, so React state alone
 * would lose them.
 */

export interface Task {
  id: string;
  title: string;
  /** Estimated length in minutes. */
  duration: number;
  description?: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt: number | null;
}

/** Raw shape coming from a form; `duration` can still be the input's string. */
export interface TaskInput {
  title: string;
  duration: number | string;
  description?: string;
}

export type TaskField = "title" | "duration" | "description" | "form";

export type TaskErrors = Partial<Record<TaskField, string>>;

export type TaskResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: TaskErrors };

export type NormalizedTaskInput = {
  title: string;
  duration: number;
  description?: string;
};

export const TASKS_STORAGE_KEY = "tasks";
export const ACTIVE_TASK_KEY = "activeTaskId";

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;
export const DURATION_MIN = 1;
export const DURATION_MAX = 480;

export function validateTaskInput(input: TaskInput): TaskResult<NormalizedTaskInput> {
  const errors: TaskErrors = {};

  const title = typeof input.title === "string" ? input.title.trim() : "";

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  const rawDuration = typeof input.duration === "string" ? input.duration.trim() : input.duration;
  const duration = rawDuration === "" ? Number.NaN : Number(rawDuration);

  if (!Number.isFinite(duration)) {
    errors.duration = "Duration must be a number.";
  } else if (!Number.isInteger(duration)) {
    errors.duration = "Duration must be a whole number of minutes.";
  } else if (duration < DURATION_MIN || duration > DURATION_MAX) {
    errors.duration = `Duration must be between ${DURATION_MIN} and ${DURATION_MAX} minutes.`;
  }

  const description =
    typeof input.description === "string" ? input.description.trim() : undefined;

  if (description && description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      title,
      duration,
      ...(description ? { description } : {}),
    },
  };
}

/** Serializes read-modify-write cycles so two quick actions can't clobber each other. */
let queue: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Also accepts the `{ name, time }` shape an earlier version produced. */
function normalizeTask(raw: unknown, index: number): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;

  const title =
    typeof value.title === "string"
      ? value.title.trim()
      : typeof value.name === "string"
        ? value.name.trim()
        : "";
  if (!title) return null;

  const duration = Number(value.duration ?? value.time);
  const description = typeof value.description === "string" ? value.description.trim() : "";

  return {
    id: typeof value.id === "string" ? value.id : `legacy-${index}`,
    title,
    duration:
      Number.isFinite(duration) && duration > 0
        ? Math.min(Math.round(duration), DURATION_MAX)
        : 25,
    description: description || undefined,
    isCompleted: Boolean(value.isCompleted),
    createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
    completedAt: typeof value.completedAt === "number" ? value.completedAt : null,
  };
}

async function readTasks(): Promise<Task[]> {
  const result = await browser.storage.local.get(TASKS_STORAGE_KEY);
  const raw = result[TASKS_STORAGE_KEY];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => normalizeTask(item, index))
    .filter((task): task is Task => task !== null);
}

async function writeTasks(tasks: Task[]): Promise<void> {
  await browser.storage.local.set({ [TASKS_STORAGE_KEY]: tasks });
}

export async function getTasks(): Promise<Task[]> {
  return readTasks();
}

/** The task the user explicitly picked to focus on, if any. */
export async function getActiveTaskId(): Promise<string | null> {
  const result = await browser.storage.local.get(ACTIVE_TASK_KEY);
  const value = result[ACTIVE_TASK_KEY];
  return typeof value === "string" ? value : null;
}

/** Passing null clears the pick. Unknown ids are ignored. */
export async function setActiveTaskId(id: string | null): Promise<void> {
  if (id === null) {
    await browser.storage.local.set({ [ACTIVE_TASK_KEY]: null });
    return;
  }

  const tasks = await readTasks();
  if (!tasks.some((task) => task.id === id)) return;

  await browser.storage.local.set({ [ACTIVE_TASK_KEY]: id });
}

export async function addTask(input: TaskInput): Promise<TaskResult<Task>> {
  const validated = validateTaskInput(input);
  if (!validated.ok) return validated;

  return serial(async () => {
    const tasks = await readTasks();
    const task: Task = {
      id: crypto.randomUUID(),
      ...validated.data,
      isCompleted: false,
      createdAt: Date.now(),
      completedAt: null,
    };

    await writeTasks([...tasks, task]);
    return { ok: true as const, data: task };
  });
}

export async function updateTask(id: string, input: TaskInput): Promise<TaskResult<Task>> {
  const validated = validateTaskInput(input);
  if (!validated.ok) return validated;

  return serial(async () => {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === id);
    const current = index === -1 ? undefined : tasks[index];
    if (!current) return { ok: false as const, errors: { form: "Task not found." } };

    const updated: Task = {
      ...current,
      title: validated.data.title,
      duration: validated.data.duration,
      description: validated.data.description,
    };

    const next = [...tasks];
    next[index] = updated;
    await writeTasks(next);
    return { ok: true as const, data: updated };
  });
}

export async function toggleTask(id: string): Promise<Task | null> {
  return serial(async () => {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === id);
    const current = index === -1 ? undefined : tasks[index];
    if (!current) return null;

    const updated: Task = {
      ...current,
      isCompleted: !current.isCompleted,
      completedAt: current.isCompleted ? null : Date.now(),
    };

    const next = [...tasks];
    next[index] = updated;
    await writeTasks(next);
    return updated;
  });
}

export async function deleteTask(id: string): Promise<boolean> {
  return serial(async () => {
    const tasks = await readTasks();
    const next = tasks.filter((task) => task.id !== id);
    if (next.length === tasks.length) return false;

    await writeTasks(next);

    const activeId = await getActiveTaskId();
    if (activeId === id) await setActiveTaskId(null);

    return true;
  });
}
