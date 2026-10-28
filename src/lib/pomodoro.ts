export const MODE_MINUTES = {
  focus: 25,
  short: 5,
  long: 15,
} as const;

export type Mode = keyof typeof MODE_MINUTES;

export type TimerState = {
  running: boolean;
  endTime: number | null;
  mode: Mode;
  /** Full length of the current mode, in ms. */
  durationMs: number;
  /** Time left when the timer is paused (ignored while running). */
  remainingMs: number;
  /** Completed focus sessions in the current set of 4. */
  cycle: number;
};

export const FOCUS_PER_CYCLE = 4;

export const DEFAULT_TIMER: TimerState = {
  running: false,
  endTime: null,
  mode: "focus",
  durationMs: MODE_MINUTES.focus * 60_000,
  remainingMs: MODE_MINUTES.focus * 60_000,
  cycle: 0,
};

export function modeDurationMs(mode: Mode) {
  return MODE_MINUTES[mode] * 60_000;
}

export function clampCycle(cycle: number) {
  return Math.min(FOCUS_PER_CYCLE, Math.max(0, Math.floor(cycle) || 0));
}

/** Fills in missing fields so old `{ running, endTime }` storage keeps working. */
export function normalizeTimer(raw: Partial<TimerState> | undefined | null): TimerState {
  const mode: Mode = raw?.mode && raw.mode in MODE_MINUTES ? raw.mode : "focus";
  const durationMs = modeDurationMs(mode);
  const remainingMs =
    typeof raw?.remainingMs === "number"
      ? Math.min(Math.max(0, raw.remainingMs), durationMs)
      : durationMs;

  return {
    running: Boolean(raw?.running) && typeof raw?.endTime === "number",
    endTime: typeof raw?.endTime === "number" ? raw.endTime : null,
    mode,
    durationMs,
    remainingMs,
    cycle: clampCycle(raw?.cycle ?? 0),
  };
}

/**
 * focus -> short break, and every 4th focus -> long break.
 * breaks -> focus. a finished long break starts a fresh set.
 */
export function nextSession(mode: Mode, cycle: number): { mode: Mode; cycle: number } {
  if (mode === "focus") {
    const nextCycle = clampCycle(cycle + 1);
    return { mode: nextCycle >= FOCUS_PER_CYCLE ? "long" : "short", cycle: nextCycle };
  }
  if (mode === "long") return { mode: "focus", cycle: 0 };
  return { mode: "focus", cycle: clampCycle(cycle) };
}

export function notificationFor(finished: Mode, next: Mode) {
  if (finished === "focus") {
    return { title: "Focus complete", message: `Time for a ${next === "long" ? "long" : "short"} break.` };
  }
  return { title: "Break over", message: "Ready for the next focus session." };
}
