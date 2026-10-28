import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TIMER,
  modeDurationMs,
  normalizeTimer,
  type Mode,
  type TimerState,
} from "@/lib/pomodoro";

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Reads the pomodoro state from browser.storage.local so the popup, the
 * background script and every view agree on the same timer. The state
 * machine itself lives in the background (it has to keep counting when the
 * popup is closed), this hook only derives display values from it.
 */
export function useTimer() {
  const [timer, setTimer] = useState<TimerState>(DEFAULT_TIMER);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    browser.storage.local.get("timer").then((res) => {
      setTimer(normalizeTimer(res.timer as Partial<TimerState> | undefined));
    });

    const onChange = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area !== "local" || !changes.timer) return;
      setTimer(normalizeTimer(changes.timer.newValue as Partial<TimerState> | undefined));
    };

    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, []);

  const isCounting = timer.running && timer.endTime !== null && timer.endTime > now;

  useEffect(() => {
    if (!isCounting) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isCounting]);

  const remainingMs = isCounting
    ? Math.max(0, (timer.endTime as number) - now)
    : timer.remainingMs;

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const canResume = !isCounting && remainingMs > 0 && remainingMs < timer.durationMs;

  const start = useCallback(() => {
    if (canResume) {
      browser.runtime.sendMessage({ type: "RESUME" });
    } else {
      browser.runtime.sendMessage({ type: "START" });
    }
  }, [canResume]);

  const stop = useCallback(() => browser.runtime.sendMessage({ type: "PAUSE" }), []);
  const reset = useCallback(() => browser.runtime.sendMessage({ type: "RESET" }), []);
  const setMode = useCallback(
    (mode: Mode) => browser.runtime.sendMessage({ type: "SELECT_MODE", mode }),
    [],
  );

  return {
    running: isCounting,
    paused: canResume,
    mode: timer.mode,
    cycle: timer.cycle,
    durationMs: timer.durationMs,
    remainingMs,
    remainingSeconds,
    minutesLeft: Math.ceil(remainingMs / 60_000),
    /** 0 = full ring, 1 = empty ring (matches TimeRing's stroke offset). */
    progress: timer.durationMs === 0 ? 0 : 1 - remainingMs / timer.durationMs,
    label: formatDuration(remainingSeconds),
    start,
    stop,
    reset,
    setMode,
  };
}

export { modeDurationMs };
export type { Mode };
