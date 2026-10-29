import { TAB_META, type TabId } from "@/lib/tabs";
import { Button } from "./ui/button";
import {Plus} from "lucide-react";
import DialogCard from "./TaskSection/DialogCard";
type HeaderProps = {
  tab: TabId;
};

export function Header({ tab }: HeaderProps) {
  const { title, logoUrl } = TAB_META[tab];

  return (
    <header className="flex items-center gap-3 rounded-2xl border border-pomo-line bg-pomo-card px-3 py-2.5">
      <span className="text-2xl"><img src={browser.runtime.getURL(logoUrl)} alt={title} className="size-10" /></span>
      <h1 className="text-lg font-medium">Pomodoro</h1>
      
        
        <span className="rounded-md bg-pomo-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-pomo-green">
        S2/4
      </span>
      <span className="text-xs text-pomo-muted">Timer</span>
      <DialogCard />
    </header>
  );
}
