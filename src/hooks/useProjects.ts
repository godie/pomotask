import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/db/projects";
import { queryKeys } from "@/lib/queryKeys";
import type { Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getAllProjects,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.projects.detail(id) : ["projects", "undefined"],
    queryFn: () => {
      if (!id) throw new Error("useProject requires an id");
      return getProjectById(id);
    },
    enabled: !!id,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) =>
      createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
