import { useCallback, useEffect, useState } from "react";

export type StoredTimer = {
  running: boolean;
  endTime: number | null;
};

const IDLE: StoredTimer = { running: false, endTime: null };

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Reads the timer from browser.storage.local so the popup, the background
 * script and every view agree on the same state. Nothing here lives in App.
 */
export function useTimer() {
  const [timer, setTimer] = useState<StoredTimer>(IDLE);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    browser.storage.local.get("timer").then((res) => {
      const stored = res.timer as StoredTimer | undefined;
      if (stored) setTimer(stored);
    });

    const onChange = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area !== "local" || !changes.timer) return;
      setTimer((changes.timer.newValue as StoredTimer | undefined) ?? IDLE);
    };

    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, []);

  const isCounting = timer.endTime !== null && timer.endTime > now;

  useEffect(() => {
    if (!isCounting) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isCounting, timer.endTime]);

  const remainingSeconds =
    timer.endTime === null ? 0 : Math.max(0, Math.ceil((timer.endTime - now) / 1000));

  const start = useCallback(
    (minutes: number) => browser.runtime.sendMessage({ type: "START", minutes }),
    [],
  );

  const stop = useCallback(() => browser.runtime.sendMessage({ type: "STOP" }), []);

  return {
    running: isCounting,
    endTime: timer.endTime,
    remainingSeconds,
    label: formatDuration(remainingSeconds),
    start,
    stop,
  };
}
