import { Play } from "lucide-react";
export default function FocusTask() {
    return (
        <div className="flex max-w-full truncate items-center gap-1 text-xs text-pomo-muted mt-5">
          <div className="flex items-center gap-1 text-pomo-accent opacity-70">
            <Play size={12} />Focusing on:
          </div>
          <span className="text-pomo-fg ml-1">Refactor Chrome extension storage API</span>
        </div>
    )
}