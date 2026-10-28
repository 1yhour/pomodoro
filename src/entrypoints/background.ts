import {
  modeDurationMs,
  nextSession,
  normalizeTimer,
  notificationFor,
  type Mode,
  type TimerState,
} from "@/lib/pomodoro";

const ALARMS_NAME = "pomodoro";

async function readTimer(): Promise<TimerState> {
  const res = await browser.storage.local.get("timer");
  return normalizeTimer(res.timer as Partial<TimerState> | undefined);
}

async function writeTimer(patch: Partial<TimerState>) {
  const current = await readTimer();
  const next: TimerState = { ...current, ...patch };
  await browser.storage.local.set({ timer: next });
  return next;
}

async function startSession(timer: TimerState, remainingMs = timer.durationMs) {
  const endTime = Date.now() + remainingMs;
  browser.alarms.create(ALARMS_NAME, { when: endTime });
  return writeTimer({ running: true, endTime, remainingMs });
}

function selectMode(timer: TimerState, mode: Mode) {
  const durationMs = modeDurationMs(mode);
  return writeTimer({
    mode,
    durationMs,
    remainingMs: durationMs,
    running: false,
    endTime: null,
  });
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg) => {
    readTimer().then((timer) => {
      switch (msg?.type) {
        case "START":
          // ignore START while a session is already counting
          if (!timer.running) startSession(timer);
          break;

        case "PAUSE": {
          if (!timer.running || timer.endTime === null) return;
          const remainingMs = Math.max(0, timer.endTime - Date.now());
          browser.alarms.clear(ALARMS_NAME);
          writeTimer({ running: false, endTime: null, remainingMs });
          break;
        }

        case "RESUME":
          if (!timer.running) startSession(timer, timer.remainingMs || timer.durationMs);
          break;

        case "RESET":
          // stop and restore the full duration, but keep the 4-session cycle
          browser.alarms.clear(ALARMS_NAME);
          writeTimer({ running: false, endTime: null, remainingMs: timer.durationMs });
          break;

        case "SELECT_MODE":
          if (!timer.running) selectMode(timer, msg.mode as Mode);
          break;
      }
    });
  });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARMS_NAME) return;

    const timer = await readTimer();
    const next = nextSession(timer.mode, timer.cycle);
    const durationMs = modeDurationMs(next.mode);

    // The next session is selected but not started: the user presses Start.
    await browser.storage.local.set({
      timer: {
        running: false,
        endTime: null,
        mode: next.mode,
        durationMs,
        remainingMs: durationMs,
        cycle: next.cycle,
      } satisfies TimerState,
    });

    const { title, message } = notificationFor(timer.mode, next.mode);
    browser.notifications.create({
      type: "basic",
      iconUrl: "/icon/128.png",
      title,
      message,
    });
  });
});
