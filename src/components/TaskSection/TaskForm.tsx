import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DURATION_MAX,
  DURATION_MIN,
  validateTaskInput,
  type Task,
  type TaskErrors,
  type TaskInput,
  type TaskResult,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";

type TaskFormProps = {
  /** Pass a task to edit it; omit (or null) to create a new one. */
  initialValues?: Task | null;
  onSubmit: (input: TaskInput) => Promise<TaskResult<Task>>;
  onCancel?: () => void;
  submitLabel?: string;
  autoFocus?: boolean;
  className?: string;
};

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  autoFocus = false,
  className,
}: TaskFormProps) {
  const isEditing = Boolean(initialValues);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [duration, setDuration] = useState(String(initialValues?.duration ?? 25));
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<TaskErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset when the edited task changes (the dialog also remounts on open).
  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDuration(String(initialValues?.duration ?? 25));
    setDescription(initialValues?.description ?? "");
    setErrors({});
  }, [initialValues?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const input: TaskInput = { title, duration, description };

    // Validate up front so the user gets feedback without a storage round-trip.
    const validation = validateTaskInput(input);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(input);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setErrors({});
      if (!isEditing) {
        setTitle("");
        setDuration("25");
        setDescription("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "h-8 rounded-lg border-pomo-line bg-pomo-raised px-2.5 text-sm text-pomo-fg placeholder:text-pomo-muted focus-visible:ring-1 focus-visible:ring-pomo-accent focus-visible:ring-offset-0";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-pomo-line bg-pomo-card p-3",
        className,
      )}
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What are you working on?"
        aria-label="Task title"
        aria-invalid={Boolean(errors.title)}
        autoFocus={autoFocus}
        className={cn(fieldClass, "h-9 w-full")}
      />

      <div className="flex items-start gap-2">
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          aria-label="Task description"
          aria-invalid={Boolean(errors.description)}
          className={cn(fieldClass, "min-w-0 flex-1")}
        />

        <div className="relative w-20 shrink-0">
          <Input
            type="number"
            inputMode="numeric"
            min={DURATION_MIN}
            max={DURATION_MAX}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            aria-label="Task duration in minutes"
            aria-invalid={Boolean(errors.duration)}
            className={cn(
              fieldClass,
              "w-full pl-2.5 pr-5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
            )}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-pomo-muted">
            m
          </span>
        </div>
      </div>

      {(errors.title || errors.duration || errors.description || errors.form) && (
        <div className="flex flex-col gap-0.5">
          {[errors.title, errors.duration, errors.description, errors.form].map((message) =>
            message ? (
              <p key={message} className="text-[10px] text-pomo-accent">
                {message}
              </p>
            ) : null,
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            size="sm"
            onClick={onCancel}
            className="h-8 bg-pomo-raised text-xs text-pomo-muted hover:bg-pomo-raised/70 hover:text-pomo-fg"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={submitting}
          className="h-8 bg-pomo-accent text-xs font-semibold text-white hover:brightness-110"
        >
          {submitting ? "Saving…" : (submitLabel ?? (isEditing ? "Save" : "Add task"))}
        </Button>
      </div>
    </form>
  );
}
