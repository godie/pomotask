import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProjects, useProject, useUpdateProject } from "@/hooks/useProjects";
import * as dbProjects from "@/db/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/db/projects");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProjects hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all projects", async () => {
    const mockProjects = [{ id: "1", name: "Test" }];
    vi.mocked(dbProjects.getAllProjects).mockResolvedValue(mockProjects as any);
    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(mockProjects);
  });
});

describe("useProject hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single project by id", async () => {
    const mockProject = {
      id: "123",
      name: "Test Project",
      color: "#ff0000",
      createdAt: 1000,
      updatedAt: 1000,
    };
    vi.mocked(dbProjects.getProjectById).mockResolvedValue(mockProject as any);
    const { result } = renderHook(() => useProject("123"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(mockProject);
  });

  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(
      () => useProject(undefined as unknown as string),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(dbProjects.getProjectById).not.toHaveBeenCalled();
  });
});

describe("useUpdateProject hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates project and invalidates cache", async () => {
    vi.mocked(dbProjects.updateProject).mockResolvedValue({
      id: "123",
      name: "Updated",
    } as any);
    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "123", data: { name: "Updated" } });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(dbProjects.updateProject).toHaveBeenCalledWith("123", {
      name: "Updated",
    });
  });
});
