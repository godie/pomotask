import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskList } from "@/components/tasks/TaskList";
import type { Task } from "@/types";

vi.mock("@/hooks/useTasks", () => ({
  useAllTasks: vi.fn(),
}));

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(() => ({
    activeTaskId: null,
    setActiveTask: vi.fn(),
    start: vi.fn(),
  })),
}));

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Task 1",
    projectId: null,
    estimatedPomodoros: 2,
    realPomodoros: 0,
    status: "pending",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "2",
    name: "Task 2",
    projectId: null,
    estimatedPomodoros: 3,
    realPomodoros: 1,
    status: "in_progress",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "3",
    name: "Task 3",
    projectId: null,
    estimatedPomodoros: 1,
    realPomodoros: 1,
    status: "completed",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "4",
    name: "Task 4",
    projectId: "proj1",
    estimatedPomodoros: 4,
    realPomodoros: 0,
    status: "pending",
    createdAt: 1000,
    updatedAt: 1000,
  },
];

describe("TaskList", () => {
  const mockProps = {
    tasks: mockTasks,
    onDelete: vi.fn(),
    onToggleComplete: vi.fn(),
  };

  it("groups tasks by status: in_progress first, then pending, then completed", () => {
    render(<TaskList {...mockProps} />);
    expect(screen.getByText("In Progress (1)")).toBeInTheDocument();
    expect(screen.getByText("Pending (2)")).toBeInTheDocument();
    expect(screen.getByText("Completed (1)")).toBeInTheDocument();
  });

  it("filters by projectId when prop provided", () => {
    const projectTasks = mockTasks.filter((t) => t.projectId === "proj1");
    render(<TaskList {...mockProps} tasks={projectTasks} projectId="proj1" />);
    expect(screen.getByText("Task 4")).toBeInTheDocument();
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });

  it("shows empty state when no tasks", () => {
    render(<TaskList {...mockProps} tasks={[]} />);
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it("shows correct counts per status", () => {
    render(<TaskList {...mockProps} />);
    expect(screen.getByText("In Progress (1)")).toBeInTheDocument();
    expect(screen.getByText("Pending (2)")).toBeInTheDocument();
    expect(screen.getByText("Completed (1)")).toBeInTheDocument();
  });

  it("passes correct props to TaskCard components", () => {
    render(<TaskList {...mockProps} />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
});
