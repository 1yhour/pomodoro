import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { TimerView } from "@/views/TimerView";
import { TasksView } from "@/views/TasksView";
import { HistoryView } from "@/views/HistoryView";
import { SettingsView } from "@/views/SettingsView";
import type { TabId } from "@/lib/tabs";
export default function App() {
  const [tab, setTab] = useState<TabId>("timer");

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <Header tab={tab} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {tab === "timer" && <TimerView />}
        {tab === "tasks" && <TasksView />}
        {tab === "history" && <HistoryView />}
        {tab === "settings" && <SettingsView />}
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
