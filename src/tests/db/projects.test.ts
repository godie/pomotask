import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "@/db/projects";
import { db } from "@/db/schema";

vi.mock("@/db/schema", () => ({
  db: {
    projects: {
      toArray: vi.fn(),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("db/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllProjects calls db.projects.toArray", async () => {
    const mockProjects = [{ id: "1", name: "Test" }];
    vi.mocked(db.projects.toArray).mockResolvedValue(mockProjects as any);

    const result = await getAllProjects();

    expect(db.projects.toArray).toHaveBeenCalled();
    expect(result).toEqual(mockProjects);
  });

  it("createProject adds a project with generated fields", async () => {
    const projectData = { name: "New Project", color: "#ff0000" };

    const result = await createProject(projectData);

    expect(db.projects.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Project",
        color: "#ff0000",
        id: expect.any(String),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      }),
    );
    expect(result.name).toBe("New Project");
  });

  describe("getProjectById", () => {
    it("returns correct project when found", async () => {
      const mockProject = {
        id: "123",
        name: "Test Project",
        color: "#ff0000",
        createdAt: 1000,
        updatedAt: 1000,
      };
      vi.mocked(db.projects.get).mockResolvedValue(mockProject as any);

      const result = await getProjectById("123");

      expect(db.projects.get).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockProject);
    });

    it("returns undefined when project not found", async () => {
      vi.mocked(db.projects.get).mockResolvedValue(undefined);

      const result = await getProjectById("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("updateProject", () => {
    it("updates and returns updated project", async () => {
      const updatedProject = {
        id: "123",
        name: "Updated",
        color: "#ff0000",
        createdAt: 1000,
        updatedAt: 2000,
      };
      vi.mocked(db.projects.get).mockResolvedValue(updatedProject as any);

      const result = await updateProject("123", { name: "Updated" });

      expect(db.projects.update).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          name: "Updated",
          updatedAt: expect.any(Number),
        }),
      );
      expect(result).toEqual(updatedProject);
    });

    it("throws error when project not found", async () => {
      vi.mocked(db.projects.get).mockResolvedValue(undefined);

      await expect(
        updateProject("nonexistent", { name: "Test" }),
      ).rejects.toThrow("Project with id nonexistent not found");
    });
  });

  it("deleteProject calls db.projects.delete with correct id", async () => {
    await deleteProject("123");

    expect(db.projects.delete).toHaveBeenCalledWith("123");
  });
});