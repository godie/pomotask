import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "@/hooks/useTimer";
import * as timerStore from "@/stores/timerStore";

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(),
}));

describe("useTimer", () => {
  const mockStore = {
    status: "idle" as const,
    mode: "focus" as const,
    secondsLeft: 1500,
    pomodorosCompleted: 0,
    totalPomodorosToday: 0,
    activeTaskId: null,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    skip: vi.fn(),
    reset: vi.fn(),
    setActiveTask: vi.fn(),
    tick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(timerStore.useTimerStore).mockImplementation(() => mockStore);
  });

  it("returns timer state from store", () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("focus");
    expect(result.current.secondsLeft).toBe(1500);
  });

  it("calls start when start is triggered", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.start();
    });
    expect(mockStore.start).toHaveBeenCalled();
  });

  it("calls pause when pause is triggered", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.pause();
    });
    expect(mockStore.pause).toHaveBeenCalled();
  });

  it("calls resume when resume is triggered", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.resume();
    });
    expect(mockStore.resume).toHaveBeenCalled();
  });

  it("calls skip when skip is triggered", async () => {
    const { result } = renderHook(() => useTimer());
    await act(async () => {
      await result.current.skip();
    });
    expect(mockStore.skip).toHaveBeenCalled();
  });

  it("calls reset when reset is triggered", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.reset();
    });
    expect(mockStore.reset).toHaveBeenCalled();
  });

  it("calls setActiveTask with taskId", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.setActiveTask("task-123");
    });
    expect(mockStore.setActiveTask).toHaveBeenCalledWith("task-123");
  });

  it("handles setting activeTask to null", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.setActiveTask(null);
    });
    expect(mockStore.setActiveTask).toHaveBeenCalledWith(null);
  });
});
