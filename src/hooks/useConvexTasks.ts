import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useConvexCreateTask() {
  return useMutation(api.tasks.createTask);
}

export function useConvexClaimTask() {
  return useMutation(api.tasks.claimTask);
}

export function useConvexReportProgress() {
  return useMutation(api.tasks.reportProgress);
}

export function useConvexCompleteTask() {
  return useMutation(api.tasks.completeTask);
}

export function useConvexFailTask() {
  return useMutation(api.tasks.failTask);
}
