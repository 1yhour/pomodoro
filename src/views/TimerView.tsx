import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";

const PRESETS = [
  { label: "25m", minutes: 25 },
  { label: "5m", minutes: 5 },
  { label: "50m", minutes: 50 },
];

export function TimerView() {
  const { running, label, start, stop } = useTimer();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-pomo-muted">
          {running ? "In focus" : "Ready"}
        </p>
        <p className="mt-3 text-7xl font-bold leading-none tracking-tighter tabular-nums text-pomo-fg">
          {label}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.minutes}
            type="button"
            onClick={() => start(preset.minutes)}
            className="rounded-md border border-pomo-line bg-pomo-card px-3 py-1.5 text-xs text-pomo-muted transition-colors hover:bg-pomo-raised hover:text-pomo-fg"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => (running ? stop() : start(25))}
        className="w-40 bg-pomo-accent text-pomo-bg hover:bg-pomo-accent/90"
      >
        {running ? <Pause /> : <Play />}
        {running ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
