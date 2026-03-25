import type { Task } from "@/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  projectId?: string;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

function groupTasksByStatus(tasks: Task[]) {
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "completed");
  return { inProgress, pending, completed };
}

export function TaskList({ tasks, onDelete, onToggleComplete }: TaskListProps) {
  const { inProgress, pending, completed } = groupTasksByStatus(tasks);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-outline/10 rounded-3xl bg-surface_container/30">
        <h3 className="text-xl font-headline font-bold mb-2 text-on_surface">
          No tasks
        </h3>
        <p className="text-sm text-on_surface_variant">
          Add a task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {inProgress.length > 0 && (
        <section>
          <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            In Progress ({inProgress.length})
          </h2>
          <div
            className="flex flex-col gap-3"
            role="region"
            aria-label="In Progress tasks"
          >
            {inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            Pending ({pending.length})
          </h2>
          <div
            className="flex flex-col gap-3"
            role="region"
            aria-label="Pending tasks"
          >
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-surface_variant" />
            Completed ({completed.length})
          </h2>
          <div
            className="flex flex-col gap-3"
            role="region"
            aria-label="Completed tasks"
          >
            {completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
