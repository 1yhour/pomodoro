import { expect, test, vi } from "vitest";
import type { Mode } from "@/lib/pomodoro";
import type { TimerState } from "@/lib/pomodoro";
import { addTask } from "@/lib/tasks";
const MODE_MINUTES = {
    focus: 25,
    short: 5,
    long: 15,
} as const;

const MODE = (mode: Mode)=>{
    return MODE_MINUTES[mode] * 60_000;
}
test('test mode', ()=>{
    expect(MODE('focus')).toBe(1500_000);
    expect(MODE('short')).toBe(300_000);
    expect(MODE('long')).toBe(900_000);
})

const FocusMode = 5;

function clampCycle(cycle: number){
    return Math.min(FocusMode, Math.max(0,Math.floor(cycle) || 0))
}
test("clampcycle test" , ()=>{
    expect(clampCycle(5)).toBe(5);
    // expect(clampCycle(0)).toBe(0);
    // expect(clampCycle(4)).toBe(4);
    // expect(clampCycle(1)).toBe(1);
})

function Remaining(raw: Partial<TimerState> | undefined | null){
    const mode = raw?.mode && raw.mode in MODE_MINUTES ? raw.mode : "focus";
    const durationMs = MODE(mode);
    const remainingMs =
      typeof raw?.remainingMs === "number"
        ? Math.min(Math.max(0, raw.remainingMs), durationMs)
        : durationMs;
    return {
        remainingMs, 
        durationMs
    };
}

test("test remaining time", ()=>{
    expect(Remaining({mode: "short", remainingMs: 2})).toEqual({ remainingMs: 2, durationMs: MODE('short') });
    expect(Remaining({mode: "short", remainingMs: 0})).toEqual({ remainingMs: 0, durationMs: MODE('short') });
    expect(Remaining({mode: "short", remainingMs: -1})).toEqual({ remainingMs: 0, durationMs: MODE('short') });
    expect(Remaining({mode: "short", remainingMs: 10000})).toEqual({ remainingMs: 10000, durationMs: MODE('short') });
    expect(Remaining({mode: "short", remainingMs: MODE("short")})).toEqual({ remainingMs: MODE("short"), durationMs: MODE('short') });
    expect(Remaining({mode: "short", remainingMs: MODE("short") + 1})).toEqual({ remainingMs: MODE("short"), durationMs: MODE('short') });
})
const notificationFor = (mode: Mode, nextmode: Mode)=>{
    if (mode === "focus") {
    return { title: "Focus complete", message: `Time for a ${nextmode === "long" ? "long" : "short"} break.` };
  }
  return { title: "Break over", message: "Ready for the next focus session." };
}
test('notificationFor test', () => {
    expect(notificationFor('focus', 'short')).toEqual({ title: "Focus complete", message: `Time for a short break.` });
    expect(notificationFor('short', 'long')).toEqual({ title: "Break over", message: "Ready for the next focus session." });
    expect(notificationFor('long', 'focus')).toEqual({ title: "Break over", message: "Ready for the next focus session." });
})
test('test add task', async ()=>{
    const store: Record<string, unknown> = {};
    vi.stubGlobal("browser", {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: store[key] }),
          set: async (items: Record<string, unknown>) => { Object.assign(store, items); },
        },
      },
    });

    const result = await addTask({ title: "test", duration: 1, description: "test" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({
        title: "test",
        duration: 1,
        description: "test",
        isCompleted: false,
    });
})