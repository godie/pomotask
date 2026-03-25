import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSession,
  getSessionsByTask,
  getTodaySessions,
} from "@/db/sessions";
import { db } from "@/db/schema";

const { equalsMock, aboveOrEqualMock, toArrayMock } = vi.hoisted(() => ({
  equalsMock: vi.fn(),
  aboveOrEqualMock: vi.fn(),
  toArrayMock: vi.fn(),
}));

vi.mock("@/db/schema", () => ({
  db: {
    sessions: {
      add: vi.fn(),
      where: vi.fn((field: string) => {
        if (field === "taskId") {
          return {
            equals: equalsMock.mockReturnValue({
              toArray: toArrayMock,
            }),
          };
        }

        if (field === "startedAt") {
          return {
            aboveOrEqual: aboveOrEqualMock.mockReturnValue({
              toArray: toArrayMock,
            }),
          };
        }

        throw new Error(`Unexpected where field: ${field}`);
      }),
    },
  },
}));

describe("db/sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    equalsMock.mockReset();
    aboveOrEqualMock.mockReset();
    toArrayMock.mockReset();
  });

  it("createSession adds a session with UUID", async () => {
    const sessionData = {
      taskId: "t1",
      startedAt: 1000,
      completedAt: 2000,
      type: "focus" as const,
      durationSeconds: 1000,
    };

    await createSession(sessionData);

    expect(db.sessions.add).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "t1",
        id: expect.any(String),
      }),
    );
  });

  it("getSessionsByTask returns sessions for specific task", async () => {
    const mockSessions = [
      {
        id: "s1",
        taskId: "t1",
        startedAt: 1000,
        completedAt: 2000,
        type: "focus" as const,
        durationSeconds: 1000,
      },
      {
        id: "s2",
        taskId: "t1",
        startedAt: 3000,
        completedAt: 4000,
        type: "focus" as const,
        durationSeconds: 1000,
      },
    ];
    toArrayMock.mockResolvedValue(mockSessions);

    const result = await getSessionsByTask("t1");

    expect(db.sessions.where).toHaveBeenCalledWith("taskId");
    expect(equalsMock).toHaveBeenCalledWith("t1");
    expect(result).toEqual(mockSessions);
  });

  it("getTodaySessions filters from start of current day", async () => {
    const mockSessions = [
      {
        id: "s1",
        taskId: "t1",
        startedAt: Date.now(),
        completedAt: Date.now() + 1000,
        type: "focus" as const,
        durationSeconds: 1000,
      },
    ];
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    toArrayMock.mockResolvedValue(mockSessions);

    const result = await getTodaySessions();

    expect(db.sessions.where).toHaveBeenCalledWith("startedAt");
    expect(aboveOrEqualMock).toHaveBeenCalledWith(startOfDay);
    expect(result).toEqual(mockSessions);
  });
});
