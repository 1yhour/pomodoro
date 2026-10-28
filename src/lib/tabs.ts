import type { PublicPath } from "wxt/browser";

export const TAB_IDS = ["timer", "tasks", "history", "settings"] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_META = {
  timer: { title: "Pomodoro", label: "Timer", logoUrl: "/icon/128.png" },
  tasks: { title: "Task", label: "Task", logoUrl: "/icon/128.png" },
  history: { title: "History", label: "History", logoUrl: "/icon/128.png" },
  settings: { title: "Settings", label: "Settings", logoUrl: "/icon/128.png" },
} satisfies Record<TabId, { title: string; label: string; logoUrl: PublicPath }>;
