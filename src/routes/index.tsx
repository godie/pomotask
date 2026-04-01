import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { TimerRing } from "@/components/timer/TimerRing";
import { LabelledTimerControls } from "@/components/timer/LabelledTimerControls";
import { BreakOverlay } from "@/components/timer/BreakOverlay";
import { TaskSelector } from "@/components/timer/TaskSelector";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Dialog } from "@/components/ui/Dialog";
import { DashboardFocusStats } from "@/components/home/DashboardFocusStats";
import { DashboardActiveTask } from "@/components/home/DashboardActiveTask";
import { formatTime, cn } from "@/lib/utils";
import {
  FOCUS_DURATION,
  SHORT_BREAK,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
} from "@/lib/pomodoro";
import { useAllTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useFocusStats } from "@/hooks/useFocusStats";

function modeLabel(mode: "focus" | "short_break" | "long_break"): string {
  if (mode === "focus") return "Focus mode";
  if (mode === "short_break") return "Short break";
  return "Long break";
}

function IndexPage() {
  const {
    status,
    secondsLeft,
    mode,
    activeTaskId,
    pomodorosCompleted,
    setActiveTask,
    skip,
  } = useTimerStore();
  const { data: tasks } = useAllTasks();
  const { data: projects } = useProjects();
  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { streakDays, totalFocusedLabel } = useFocusStats();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  const totalDuration =
    mode === "focus"
      ? FOCUS_DURATION
      : mode === "short_break"
        ? SHORT_BREAK
        : LONG_BREAK;
  const progress = secondsLeft / totalDuration;

  const modeColors = {
    focus: "text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.55)]",
    short_break: "text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]",
    long_break: "text-tertiary drop-shadow-[0_0_10px_rgba(255,224,74,0.45)]",
  };

  const activeTask = tasks?.find((t) => t.id === activeTaskId);
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects?.forEach((p) => {
      m.set(p.id, p.name);
    });
    return m;
  }, [projects]);

  const pendingTasksSorted = useMemo(() => {
    return (
      tasks
        ?.filter((t) => t.status === "pending")
        .sort((a, b) => a.createdAt - b.createdAt) ?? []
    );
  }, [tasks]);

  const activeOrdinal = activeTask
    ? pendingTasksSorted.findIndex((t) => t.id === activeTask.id) + 1
    : 0;
  const pendingTotal = pendingTasksSorted.length;

  const projectLabel =
    activeTask?.projectId != null
      ? (projectMap.get(activeTask.projectId) ?? "Project")
      : null;

  const cycleSlot =
    (pomodorosCompleted % POMODOROS_UNTIL_LONG_BREAK) + 1;

  const handleToggleComplete = async (task: { id: string; status: string }) => {
    await updateTask({
      id: task.id,
      data: {
        status: task.status === "completed" ? "pending" : "completed",
        completedAt: task.status === "completed" ? undefined : Date.now(),
      },
    });
  };

  return (
    <div
      className={cn(
        "max-w-6xl mx-auto w-full animate-in fade-in duration-700",
        "bg-[linear-gradient(rgba(255,45,120,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,45,120,0.03)_1px,transparent_1px)] bg-[size:48px_48px]",
      )}
    >
      {status === "idle" && mode !== "focus" && (
        <BreakOverlay mode={mode} onSkip={skip} />
      )}

      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] items-start">
        <section className="flex flex-col items-center text-center space-y-6 sm:space-y-8 pt-2 pb-4">
          <p className="font-label text-[10px] sm:text-xs uppercase tracking-[0.35em] text-on_surface_variant">
            {modeLabel(mode)}
          </p>

          <div className="relative">
            <TimerRing progress={progress} mode={mode} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={cn(
                  "font-headline text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter tabular-nums",
                  modeColors[mode],
                )}
              >
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>

          <LabelledTimerControls />
        </section>

        <aside className="flex flex-col gap-4 sm:gap-5 w-full lg:pt-10">
          <DashboardFocusStats
            streakDays={streakDays}
            totalFocusedLabel={totalFocusedLabel}
          />

          <DashboardActiveTask
            task={activeTask}
            projectLabel={projectLabel}
            activeOrdinal={activeOrdinal}
            pendingTotal={pendingTotal}
            onOpenTaskPicker={() => {
              setTaskPickerOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
            onCreateTask={() => {
              setIsCreateOpen(true);
            }}
          />

          {activeTask ? (
            <p className="text-center lg:text-left font-label text-[10px] uppercase tracking-widest text-on_surface_variant px-1">
              Cycle {cycleSlot} / {POMODOROS_UNTIL_LONG_BREAK} — long break after
              every {POMODOROS_UNTIL_LONG_BREAK} focus blocks
            </p>
          ) : null}
        </aside>
      </div>

      <TaskSelector
        variant="pickerOnly"
        tasks={tasks}
        activeTaskId={activeTaskId}
        setActiveTask={setActiveTask}
        onToggleComplete={handleToggleComplete}
        onCreateTask={() => {
          setIsCreateOpen(true);
        }}
        taskPickerOpen={taskPickerOpen}
        onTaskPickerOpenChange={setTaskPickerOpen}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <TaskForm
          title="Add Task"
          onSubmit={async (data) => {
            const task = await createTask(data);
            setIsCreateOpen(false);
            return task;
          }}
          onCancel={() => {
            setIsCreateOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
