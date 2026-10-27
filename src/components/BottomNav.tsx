import { History, ListTodo, Settings, Timer, type LucideIcon } from "lucide-react";
import { TAB_IDS, TAB_META, type TabId } from "@/lib/tabs";
import { cn } from "@/lib/utils";

const ICONS: Record<TabId, LucideIcon> = {
  timer: Timer,
  tasks: ListTodo,
  history: History,
  settings: Settings,
};

type BottomNavProps = {
  tab: TabId;
  onChange: (tab: TabId) => void;
};

export function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav className="grid grid-cols-4 rounded-2xl border border-pomo-line bg-pomo-card p-1.5">
      {TAB_IDS.map((id) => {
        const Icon = ICONS[id];
        const active = id === tab;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] transition-colors",
              active
                ? "bg-pomo-raised text-pomo-fg"
                : "text-pomo-muted hover:bg-pomo-raised/60 hover:text-pomo-fg",
            )}
          >
            <Icon className="size-4" />
            {TAB_META[id].label}
          </button>
        );
      })}
    </nav>
  );
}
