import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskSelector } from "@/components/timer/TaskSelector";
import type { Task } from "@/types";

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
    status: "pending",
    createdAt: 1000,
    updatedAt: 1000,
  },
];

describe("TaskSelector", () => {
  it("shows list of pending tasks when changing task", () => {
    const setActiveTask = vi.fn();
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={setActiveTask}
      />
    );

    const changeButton = screen.getByText(/Change Task/i);
    fireEvent.click(changeButton);

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("selecting task calls setActiveTask", () => {
    const setActiveTask = vi.fn();
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={setActiveTask}
      />
    );

    fireEvent.click(screen.getByText(/Change Task/i));
    fireEvent.click(screen.getByText("Task 1"));

    expect(setActiveTask).toHaveBeenCalledWith("1");
  });

  it("shows active task name when set", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId="1"
        setActiveTask={vi.fn()}
      />
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("0 / 2 Pomodoros")).toBeInTheDocument();
  });

  it("shows empty state when no pending tasks found", () => {
    render(
      <TaskSelector
        tasks={[]}
        activeTaskId={null}
        setActiveTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Change Task/i));
    expect(screen.getByText(/No pending tasks found/i)).toBeInTheDocument();
  });
});
