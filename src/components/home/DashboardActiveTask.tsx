import type { Task } from "@/types";
import { Check, MoreVertical, Plus } from "lucide-react";

interface DashboardActiveTaskProps {
  task: Task | undefined;
  projectLabel: string | null;
  activeOrdinal: number;
  pendingTotal: number;
  onOpenTaskPicker: () => void;
  onToggleComplete?: (task: Task) => void;
  onCreateTask: () => void;
}

export function DashboardActiveTask({
  task,
  projectLabel,
  activeOrdinal,
  pendingTotal,
  onOpenTaskPicker,
  onToggleComplete,
  onCreateTask,
}: DashboardActiveTaskProps) {
  const projectLine =
    projectLabel ?? (task ? "No project" : "Pick a task to focus");

  return (
    <div className="w-full rounded-2xl border border-outline/15 bg-surface_container_high/90 p-4 sm:p-5 shadow-[inset_0_0_24px_rgba(255,45,120,0.04)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-label text-[10px] sm:text-xs uppercase tracking-widest text-on_surface_variant mb-1">
            Tasks
          </p>
          <p className="font-label text-xs text-secondary tabular-nums">
            Active:{" "}
            {task && pendingTotal > 0
              ? `${String(activeOrdinal).padStart(2, "0")} / ${String(pendingTotal).padStart(2, "0")}`
              : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTask}
          className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary/90 transition-colors font-label uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add task
        </button>
      </div>

      {task ? (
        <div className="flex gap-3 sm:gap-4 items-start">
          {onToggleComplete && (
            <button
              type="button"
              onClick={() => {
                onToggleComplete(task);
              }}
              className="mt-0.5 w-10 h-10 rounded-xl border-2 border-primary/35 flex items-center justify-center text-primary hover:bg-primary/10 hover:shadow-[0_0_14px_rgba(255,45,120,0.25)] transition-all shrink-0"
              aria-label={`Mark ${task.name} complete`}
            >
              <Check className="w-5 h-5" strokeWidth={2.5} aria-hidden />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on_surface leading-tight break-words">
              {task.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-on_surface_variant">
              <span className="text-on_surface_variant/80">Project:</span>{" "}
              {projectLine}
              {" "}
              <span aria-hidden>•</span>{" "}
              {task.realPomodoros}/{task.estimatedPomodoros} Pomodoros
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTaskPicker}
            className="p-2 rounded-xl border border-outline/20 text-on_surface_variant hover:text-on_surface hover:bg-surface_variant/80 transition-colors shrink-0"
            aria-label="Open task list"
          >
            <MoreVertical className="w-5 h-5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenTaskPicker}
          className="w-full text-left rounded-xl border border-dashed border-outline/25 bg-surface/40 px-4 py-6 text-on_surface_variant hover:border-primary/30 hover:text-on_surface transition-colors"
        >
          <span className="font-headline font-semibold text-on_surface">
            Select a task
          </span>
          <span className="block text-sm mt-1 text-on_surface_variant">
            Choose what you are working on to track Pomodoros
          </span>
        </button>
      )}
    </div>
  );
}
