import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addTask,
  deleteTask,
  getActiveTaskId,
  getTasks,
  setActiveTaskId,
  toggleTask,
  updateTask,
  validateTaskInput,
} from "./tasks";

let store: Record<string, unknown>;

beforeEach(() => {
  store = {};
  vi.stubGlobal("browser", {
    storage: {
      local: {
        get: async (key: string) => ({ [key]: store[key] }),
        set: async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        },
      },
    },
  });
});

describe("validateTaskInput", () => {
  it("trims input and accepts a numeric string duration", () => {
    const result = validateTaskInput({ title: "  Write tests  ", duration: "25" });

    expect(result).toEqual({
      ok: true,
      data: { title: "Write tests", duration: 25 },
    });
  });

  it("drops an empty description", () => {
    const result = validateTaskInput({ title: "Task", duration: 5, description: "   " });

    expect(result.ok && "description" in result.data).toBe(false);
  });

  it("rejects an empty or whitespace title", () => {
    const result = validateTaskInput({ title: "   ", duration: 25 });

    expect(result).toEqual({ ok: false, errors: { title: "Title is required." } });
  });

  it("rejects a title over 120 characters", () => {
    const result = validateTaskInput({ title: "a".repeat(121), duration: 25 });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors.title).toMatch(/120 characters/);
  });

  it.each([[""], ["abc"], [0], [-5], [1.5], [481]])(
    "rejects duration %s",
    (duration) => {
      const result = validateTaskInput({ title: "Task", duration: duration as string | number });

      expect(result.ok).toBe(false);
    },
  );

  it("rejects a description over 500 characters", () => {
    const result = validateTaskInput({
      title: "Task",
      duration: 25,
      description: "a".repeat(501),
    });

    expect(result.ok).toBe(false);
  });
});

describe("CRUD", () => {
  it("adds a task and persists it", async () => {
    const result = await addTask({ title: "Refactor storage", duration: 25 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toMatchObject({
      title: "Refactor storage",
      duration: 25,
      isCompleted: false,
      completedAt: null,
    });
    expect(typeof result.data.id).toBe("string");

    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.id).toBe(result.data.id);
  });

  it("does not write an invalid task", async () => {
    const result = await addTask({ title: "  ", duration: 25 });

    expect(result.ok).toBe(false);
    expect(await getTasks()).toHaveLength(0);
  });

  it("keeps every task when adding repeatedly", async () => {
    await addTask({ title: "One", duration: 25 });
    await addTask({ title: "Two", duration: 5 });

    const tasks = await getTasks();
    expect(tasks.map((task) => task.title)).toEqual(["One", "Two"]);
  });

  it("updates editable fields but keeps identity and completion", async () => {
    const created = await addTask({ title: "Old", duration: 25, description: "before" });
    if (!created.ok) throw new Error("setup failed");

    await toggleTask(created.data.id);
    const updated = await updateTask(created.data.id, { title: "New", duration: 50 });

    expect(updated.ok).toBe(true);
    if (!updated.ok) return;

    expect(updated.data).toMatchObject({
      id: created.data.id,
      title: "New",
      duration: 50,
      isCompleted: true,
      createdAt: created.data.createdAt,
    });
    expect(updated.data.description).toBeUndefined();
  });

  it("rejects an update with invalid input and leaves storage untouched", async () => {
    const created = await addTask({ title: "Keep me", duration: 25 });
    if (!created.ok) throw new Error("setup failed");

    const result = await updateTask(created.data.id, { title: "Keep me", duration: 0 });

    expect(result.ok).toBe(false);
    expect((await getTasks())[0]?.duration).toBe(25);
  });

  it("reports a missing task on update", async () => {
    const result = await updateTask("nope", { title: "Task", duration: 25 });

    expect(result).toEqual({ ok: false, errors: { form: "Task not found." } });
  });

  it("toggles completion in both directions", async () => {
    const created = await addTask({ title: "Toggle", duration: 25 });
    if (!created.ok) throw new Error("setup failed");

    const done = await toggleTask(created.data.id);
    expect(done?.isCompleted).toBe(true);
    expect(typeof done?.completedAt).toBe("number");

    const undone = await toggleTask(created.data.id);
    expect(undone?.isCompleted).toBe(false);
    expect(undone?.completedAt).toBeNull();
  });

  it("deletes a task and reports whether it existed", async () => {
    const created = await addTask({ title: "Delete me", duration: 25 });
    if (!created.ok) throw new Error("setup failed");

    expect(await deleteTask(created.data.id)).toBe(true);
    expect(await getTasks()).toHaveLength(0);
    expect(await deleteTask(created.data.id)).toBe(false);
  });
});

describe("active task pick", () => {
  it("stores and clears the picked task id", async () => {
    const created = await addTask({ title: "Focus me", duration: 25 });
    if (!created.ok) throw new Error("setup failed");

    await setActiveTaskId(created.data.id);
    expect(await getActiveTaskId()).toBe(created.data.id);

    await setActiveTaskId(null);
    expect(await getActiveTaskId()).toBeNull();
  });

  it("ignores ids that do not exist", async () => {
    await setActiveTaskId("missing");

    expect(await getActiveTaskId()).toBeNull();
  });

  it("clears the pick when that task is deleted", async () => {
    const created = await addTask({ title: "Temporary", duration: 25 });
    if (!created.ok) throw new Error("setup failed");

    await setActiveTaskId(created.data.id);
    await deleteTask(created.data.id);

    expect(await getActiveTaskId()).toBeNull();
  });

  it("keeps the pick when another task is deleted", async () => {
    const keep = await addTask({ title: "Keep", duration: 25 });
    const drop = await addTask({ title: "Drop", duration: 5 });
    if (!keep.ok || !drop.ok) throw new Error("setup failed");

    await setActiveTaskId(keep.data.id);
    await deleteTask(drop.data.id);

    expect(await getActiveTaskId()).toBe(keep.data.id);
  });
});
