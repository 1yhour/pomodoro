import { Flame, Coffee, Moon, Play, RotateCcw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TimeRing from "@/components/TimerSection/TimeRing";
import ActiveCard from "@/components/TimerSection/ActiveCard";
import FocusTask from "@/components/TimerSection/FocusTask";
import { useTimer } from "@/hooks/useTimer";
import { useTasks } from "@/hooks/useTasks";
const MODES = [
  { id: "focus", label: "Pomodoro", minutes: 25, icon: Flame },
  { id: "short", label: "Short", minutes: 5, icon: Coffee },
  { id: "long", label: "Long", minutes: 15, icon: Moon },
] as const;

export function TimerView() {
  const {
    running,
    start,
    stop,
    reset,
    label: timeLeft,
    mode,
    cycle,
    minutesLeft,
    progress,
    setMode,

  } = useTimer();
  const { activeTask, update, remove } = useTasks();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 rounded-2xl border border-pomo-line bg-pomo-card p-1.5">
        {MODES.map(({ id, label, minutes, icon: Icon }) => (
          <Button
            size="sm"
            key={id}
            variant="ghost"
            disabled={running}
            onClick={() => setMode(id)}
            className={cn(
              "flex items-center justify-center gap-1 text-[10px] transition-colors",
              mode === id
                ? "bg-pomo-accent text-pomo-fg"
                : "text-pomo-muted hover:bg-pomo-raised/60 hover:text-pomo-fg",
              running && "cursor-not-allowed",
            )}
          >
            <Icon className="size-4" />
            {label}
            <span className="ml-1 opacity-70">{minutes}m</span>
          </Button>
        ))}
      </div>
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-pomo-line bg-pomo-card px-4 py-5">
        <TimeRing progress={progress}>
          <span className="text-5xl font-medium tracking-tight">
            {timeLeft}
          </span>
          <div className="mt-2 flex gap-3">
            {[0,1,2,3].map((i)=> (
              <span
                key={i}
                className={cn(
                  "size-2 rounded-full",
                  i < cycle ? "bg-pomo-accent" : "bg-pomo-line",
                )}
              />
            ))}
          </div>
          <span className="mt-2 rounded-full bg-pomo-raised px-2.5 py-1 text-[10px] text-pomo-muted">
            <span className="mr-1 text-pomo-green">●</span>Cycle {cycle} of 4
          </span>
        </TimeRing>
        <FocusTask task={activeTask}/>
          <div className="flex w-full max-w-[224px] gap-2">
          <Button size="default" onClick={()=> reset()} className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-pomo-raised text-pomo-muted hover:text-pomo-fg">
            <RotateCcw size={16} />
          </Button>
          <Button
            size="default"
            onClick={()=> running ? stop() : start()}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pomo-accent text-sm font-semibold text-white hover:brightness-110"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pause" : "Start"}
          </Button>
        </div>
      </section>
      <ActiveCard task={activeTask} minutesLeft={minutesLeft} cycle={cycle} onEdit={update} onDelete={remove} />
    </div>
  );
}
