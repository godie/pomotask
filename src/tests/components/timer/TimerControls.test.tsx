import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerControls } from "@/components/timer/TimerControls";

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(),
}));

import { useTimerStore } from "@/stores/timerStore";

describe("TimerControls", () => {
  const mockStart = vi.fn();
  const mockPause = vi.fn();
  const mockResume = vi.fn();
  const mockReset = vi.fn();
  const mockSkip = vi.fn();

  const createMockStore = (overrides = {}) => ({
    status: "idle" as const,
    mode: "focus" as const,
    secondsLeft: 1500,
    pomodorosCompleted: 0,
    totalPomodorosToday: 0,
    activeTaskId: null,
    start: mockStart,
    pause: mockPause,
    resume: mockResume,
    reset: mockReset,
    skip: mockSkip,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTimerStore).mockImplementation(() => createMockStore());
  });

  it("renders Start button when status is idle", () => {
    render(<TimerControls />);
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("renders Pause button when status is running", () => {
    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "running" }),
    );
    render(<TimerControls />);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("renders Resume button when status is paused", () => {
    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "paused" }),
    );
    render(<TimerControls />);
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<TimerControls />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("renders Skip button", () => {
    render(<TimerControls />);
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
  });

  it("calls start when Start clicked while idle", async () => {
    const user = userEvent.setup();
    render(<TimerControls />);
    await user.click(screen.getByRole("button", { name: /start/i }));
    expect(mockStart).toHaveBeenCalled();
  });

  it("calls pause when Pause clicked while running", async () => {
    const user = userEvent.setup();
    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "running" }),
    );
    render(<TimerControls />);
    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(mockPause).toHaveBeenCalled();
  });

  it("calls resume when Resume clicked while paused", async () => {
    const user = userEvent.setup();
    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "paused" }),
    );
    render(<TimerControls />);
    await user.click(screen.getByRole("button", { name: /resume/i }));
    expect(mockResume).toHaveBeenCalled();
  });

  it("calls reset when Reset clicked", async () => {
    const user = userEvent.setup();
    render(<TimerControls />);
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(mockReset).toHaveBeenCalled();
  });

  it("calls skip when Skip clicked", async () => {
    const user = userEvent.setup();
    render(<TimerControls />);
    await user.click(screen.getByRole("button", { name: /skip/i }));
    expect(mockSkip).toHaveBeenCalled();
  });

  it("shows only one main action button at a time", () => {
    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "idle" }),
    );
    const { unmount } = render(<TimerControls />);
    expect(screen.getAllByRole("button").length).toBe(3);

    unmount();

    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "running" }),
    );
    const { unmount: u2 } = render(<TimerControls />);
    expect(screen.getAllByRole("button").length).toBe(3);
    u2();

    vi.mocked(useTimerStore).mockImplementation(() =>
      createMockStore({ status: "paused" }),
    );
    const { unmount: u3 } = render(<TimerControls />);
    expect(screen.getAllByRole("button").length).toBe(3);
    u3();
  });
});
