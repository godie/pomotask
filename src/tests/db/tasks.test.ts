import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllTasks,
  incrementRealPomodoros,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  splitTaskInDB,
} from "@/db/tasks";
import { db } from "@/db/schema";

const { equalsMock, toArrayMock } = vi.hoisted(() => ({
  equalsMock: vi.fn(),
  toArrayMock: vi.fn(),
}));

vi.mock("@/db/schema", () => ({
  db: {
    tasks: {
      toArray: vi.fn(),
      where: vi.fn(() => ({
        equals: equalsMock.mockReturnValue({
          toArray: toArrayMock,
        }),
      })),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      bulkAdd: vi.fn(),
    },
    transaction: vi.fn((_mode, _tables, callback) => callback()),
  },
}));

describe("db/tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    equalsMock.mockReset();
    toArrayMock.mockReset();
  });

  it("getAllTasks calls db.tasks.toArray", async () => {
    const mockTasks = [{ id: "1", name: "Task 1" }];
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any);

    const result = await getAllTasks();

    expect(db.tasks.toArray).toHaveBeenCalled();
    expect(result).toEqual(mockTasks);
  });

  it("incrementRealPomodoros increments count", async () => {
    const mockTask = { id: "1", realPomodoros: 2 };
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any);

    await incrementRealPomodoros("1");

    expect(db.tasks.update).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        realPomodoros: 3,
        updatedAt: expect.any(Number),
      }),
    );
  });

  it("incrementRealPomodoros does nothing when task does not exist", async () => {
    vi.mocked(db.tasks.get).mockResolvedValue(undefined);

    await incrementRealPomodoros("missing");

    expect(db.tasks.update).not.toHaveBeenCalled();
  });

  describe("getTasksByProject", () => {
    it("filters tasks by projectId", async () => {
      const mockTasks = [
        { id: "1", projectId: "proj1", name: "Task 1" },
        { id: "2", projectId: "proj1", name: "Task 2" },
      ];
      toArrayMock.mockResolvedValue(mockTasks);

      const result = await getTasksByProject("proj1");

      expect(db.tasks.where).toHaveBeenCalledWith("projectId");
      expect(equalsMock).toHaveBeenCalledWith("proj1");
      expect(result).toEqual(mockTasks);
    });
  });

  describe("getTaskById", () => {
    it("returns correct task when found", async () => {
      const mockTask = {
        id: "123",
        name: "Test Task",
        status: "pending" as const,
      };
      vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any);

      const result = await getTaskById("123");

      expect(db.tasks.get).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockTask);
    });

    it("returns undefined when task not found", async () => {
      vi.mocked(db.tasks.get).mockResolvedValue(undefined);

      const result = await getTaskById("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("createTask", () => {
    it("generates id, createdAt, updatedAt", async () => {
      const taskData = {
        name: "New Task",
        projectId: null,
        estimatedPomodoros: 3,
        realPomodoros: 0,
        status: "pending" as const,
      };

      const result = await createTask(taskData);

      expect(db.tasks.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Task",
          id: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      );
      expect(result.name).toBe("New Task");
    });
  });

  describe("updateTask", () => {
    it("updates specified fields", async () => {
      const updatedTask = {
        id: "123",
        name: "Updated",
        status: "completed" as const,
        updatedAt: 2000,
      };
      vi.mocked(db.tasks.get).mockResolvedValue(updatedTask as any);

      const result = await updateTask("123", { name: "Updated" });

      expect(db.tasks.update).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          name: "Updated",
          updatedAt: expect.any(Number),
        }),
      );
      expect(result).toEqual(updatedTask);
    });

    it("throws error when task not found", async () => {
      vi.mocked(db.tasks.get).mockResolvedValue(undefined);

      await expect(updateTask("nonexistent", { name: "Test" })).rejects.toThrow(
        "Task with id nonexistent not found",
      );
    });
  });

  it("deleteTask removes task from DB", async () => {
    await deleteTask("123");

    expect(db.tasks.delete).toHaveBeenCalledWith("123");
  });

  describe("splitTaskInDB", () => {
    it("marks original as divided and creates subtasks", async () => {
      const mockTask = {
        id: "123",
        name: "Big Task",
        projectId: "proj1",
        estimatedPomodoros: 8,
        realPomodoros: 3,
        status: "pending" as const,
      };
      vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any);

      const result = await splitTaskInDB("123");

      expect(db.transaction).toHaveBeenCalled();
      expect(db.tasks.update).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          status: "divided",
          updatedAt: expect.any(Number),
        }),
      );
      expect(db.tasks.bulkAdd).toHaveBeenCalledWith(result);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Big Task (Part 1)");
      expect(result[1].name).toBe("Big Task (Part 2)");
    });

    it("throws error when task not found", async () => {
      vi.mocked(db.tasks.get).mockResolvedValue(undefined);

      await expect(splitTaskInDB("nonexistent")).rejects.toThrow(
        "Task nonexistent not found",
      );
    });
  });
});