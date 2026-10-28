import { Ellipsis } from "lucide-react";

type Props = {
  minutesLeft: number;
  cycle: number;
};

export default function ActiveCard({ minutesLeft, cycle }: Props){
    return(
        <section className="flex items-center gap-2 rounded-2xl border border-pomo-line bg-pomo-card px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm">Refactor Chrome extension storage API</p>
            <span className="shrink-0 rounded bg-pomo-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-pomo-accent">
              ACTIVE
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-pomo-muted">
            {minutesLeft}m left • <span className="text-pomo-green">{cycle}/4 pomos</span>
          </p>
        </div>
        <button className="cursor-pointer text-pomo-muted hover:text-pomo-fg">
          <Ellipsis size={18} />
        </button>
      </section>
    )
}
