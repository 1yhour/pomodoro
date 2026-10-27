export function TasksView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-pomo-fg">No tasks yet</p>
      <p className="text-xs text-pomo-muted">Tasks attached to a focus session will show up here.</p>
    </div>
  );
}
