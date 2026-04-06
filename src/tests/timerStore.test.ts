import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTimerStore } from "@/stores/timerStore";
import {
  FOCUS_DURATION,
  SHORT_BREAK,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
} from "@/lib/pomodoro";
import { incrementRealPomodoros } from "@/db/tasks";
import { createSession } from "@/db/sessions";

// Mocks de base de datos
vi.mock("@/db/tasks", () => ({
  incrementRealPomodoros: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/db/sessions", () => ({
  createSession: vi.fn().mockResolvedValue({}),
}));

// Mock de AudioContext para evitar errores en el entorno de test
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: "",
    frequency: { value: 0 },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  })),
  destination: {},
};
global.AudioContext = vi.fn(() => mockAudioContext) as any;

// Mock de Notification
const originalNotification = global.Notification;
beforeEach(() => {
  // Reset store
  useTimerStore.setState({
    status: "idle",
    mode: "focus",
    secondsLeft: FOCUS_DURATION,
    pomodorosCompleted: 0,
    totalPomodorosToday: 0,
    activeTaskId: null,
  });
  vi.clearAllMocks();
  vi.useFakeTimers();

  // Mock Notification por defecto (permiso no concedido)
  global.Notification = {
    permission: "default",
    requestPermission: vi.fn().mockResolvedValue("granted"),
  } as any;
});

afterEach(() => {
  vi.useRealTimers();
  global.Notification = originalNotification;
});

describe("timerStore — initial state", () => {
  it("starts idle with full focus duration", () => {
    const { result } = renderHook(() => useTimerStore());
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("focus");
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);
    expect(result.current.activeTaskId).toBeNull();
  });
});

describe("timerStore — start / pause / resume", () => {
  it("transitions from idle to running on start", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    expect(result.current.status).toBe("running");
  });

  it("pauses when running", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe("paused");
  });

  it("resumes from paused", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    act(() => {
      result.current.resume();
    });
    expect(result.current.status).toBe("running");
  });
});

describe("timerStore — reset", () => {
  it("resets to initial focus state", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);
    expect(result.current.mode).toBe("focus");
  });
});

describe("timerStore — setActiveTask", () => {
  it("sets the active task id", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setActiveTask("task-123");
    });
    expect(result.current.activeTaskId).toBe("task-123");
  });

  it("clears the active task with null", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setActiveTask("task-123");
    });
    act(() => {
      result.current.setActiveTask(null);
    });
    expect(result.current.activeTaskId).toBeNull();
  });
});

describe("timerStore — break transitions (focus → break)", () => {
  it("transitions to short break after first Pomodoro", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        pomodorosCompleted: 0,
        status: "idle",
        mode: "focus",
      });
      await result.current.skip();
    });
    expect(result.current.mode).toBe("short_break");
    expect(result.current.secondsLeft).toBe(SHORT_BREAK);
    expect(result.current.status).toBe("idle");
  });

  it("transitions to long break after 4 Pomodoros", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        pomodorosCompleted: POMODOROS_UNTIL_LONG_BREAK - 1,
        status: "running",
        mode: "focus",
      });
      await result.current.skip();
    });
    expect(result.current.mode).toBe("long_break");
    expect(result.current.secondsLeft).toBe(LONG_BREAK);
  });
});

describe("timerStore — break completion (break → focus)", () => {
  it("transitions from break to focus when break ends", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      // Simular un break en curso (usuario lo inició)
      useTimerStore.setState({
        status: "running",
        mode: "short_break",
        secondsLeft: 1,
      });
      // El tick llamará a skip cuando llegue a 0
      await result.current.tick();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("focus");
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);
  });
});

describe("timerStore — tick", () => {
  it("decrements secondsLeft on tick", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({ status: "running", secondsLeft: 100 });
      await result.current.tick();
    });
    expect(result.current.secondsLeft).toBe(99);
  });

  it("does not decrement when paused or idle", async () => {
    const { result } = renderHook(() => useTimerStore());
    const initial = result.current.secondsLeft;
    await act(async () => {
      await result.current.tick(); // idle
    });
    expect(result.current.secondsLeft).toBe(initial);

    await act(async () => {
      useTimerStore.setState({ status: "paused", secondsLeft: 50 });
      await result.current.tick();
    });
    expect(result.current.secondsLeft).toBe(50);
  });
});

describe("timerStore — focus completion side effects", () => {
  it("calls incrementRealPomodoros and createSession when focus completes", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        activeTaskId: "task-1",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip(); // skip maneja la finalización
    });

    expect(incrementRealPomodoros).toHaveBeenCalledWith("task-1");
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "task-1",
        type: "focus",
      }),
    );
    expect(result.current.pomodorosCompleted).toBe(1);
    expect(result.current.totalPomodorosToday).toBe(1);
  });

  it("increments totalPomodorosToday on focus completion", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        activeTaskId: null,
        secondsLeft: 0,
        status: "running",
        totalPomodorosToday: 5,
      });
      await result.current.skip();
    });
    expect(result.current.totalPomodorosToday).toBe(6);
  });

  it("requests notification permission when sending notification and permission is default", async () => {
    // Configurar Notification con permiso "default"
    const requestPermissionMock = vi.fn().mockResolvedValue("granted");
    const notificationConstructorMock = vi.fn();
    const MockNotification = function () {
      notificationConstructorMock();
    } as any;
    MockNotification.permission = "default";
    MockNotification.requestPermission = requestPermissionMock;
    global.Notification = MockNotification;

    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip();
    });

    expect(requestPermissionMock).toHaveBeenCalled();
    expect(notificationConstructorMock).toHaveBeenCalled();
  });

  it("does not request permission when already denied", async () => {
    const requestPermissionMock = vi.fn();
    global.Notification = {
      permission: "denied",
      requestPermission: requestPermissionMock,
    } as any;

    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip();
    });

    expect(requestPermissionMock).not.toHaveBeenCalled();
  });
});

describe("timerStore — interval management (recursive setTimeout)", () => {
  it("runs tick every second when running", async () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });

    // Después de start, el primer setTimeout está programado
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);

    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Esperar a que se resuelva la promesa de tick y se reprograme
      await Promise.resolve();
    });
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION - 1);

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION - 3);
  });

  it("stops ticking when paused", async () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    const afterFirstTick = result.current.secondsLeft;

    act(() => {
      result.current.pause();
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(result.current.secondsLeft).toBe(afterFirstTick);
  });

  it("stops ticking when reset", async () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    const afterTick = result.current.secondsLeft;

    act(() => {
      result.current.reset();
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION); // reset restaura el valor inicial
    expect(result.current.status).toBe("idle");
  });

  it("clears timer on skip", async () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    const secondsBeforeSkip = result.current.secondsLeft;

    await act(async () => {
      await result.current.skip();
    });

    // Después del skip no debe quedar ningún timeout activo
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    // El tiempo no debe seguir decrementando porque el estado es idle
    expect(result.current.secondsLeft).not.toBe(secondsBeforeSkip - 1);
    expect(result.current.status).toBe("idle");
  });
});