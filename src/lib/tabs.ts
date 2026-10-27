export const TAB_IDS = ["timer", "tasks", "history", "settings"] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_META: Record<TabId, { title: string; label?: string, logoUrl: string }> = {
  timer: { title: "Pomodoro",label: "Timer", logoUrl: "icon/Tomato.png" },
  tasks: { title: "Task",label: "Task", logoUrl: "icon/Tomato.png" },
  history: { title: "History",label: "History", logoUrl: "icon/Tomato.png" },
  settings: { title: "Settings",label: "Settings", logoUrl: "icon/Tomato.png" },
};
