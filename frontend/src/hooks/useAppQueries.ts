import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi, tasksApi, dashboardApi, userApi } from "../services/api";

// Project Query Hooks
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

// Project Mutation Hooks
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email, role }: { id: string; email: string; role: string }) =>
      projectsApi.addMember(id, { email, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

// Task Query Hooks
export function useTasks(filters: { projectId?: string; status?: string; priority?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.list(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

// Task Mutation Hooks
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tasksApi.update(id, data),
    onSuccess: (data) => {
      const taskId = data.task.id;
      const projectId = data.task.projectId;
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      tasksApi.delete(id).then((res) => ({ res, projectId })),
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// Comments Query Hooks
export function useComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => tasksApi.listComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.createComment(taskId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.taskId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, taskId }: { id: string; taskId: string }) =>
      tasksApi.deleteComment(id).then((res) => ({ res, taskId })),
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

// Dashboard Stats Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });
}

export function useProjectActivity(projectId: string) {
  return useQuery({
    queryKey: ["project-activity", projectId],
    queryFn: () => dashboardApi.getProjectActivity(projectId),
    enabled: !!projectId,
  });
}

// Profile Mutation Hooks
export function useUpdateProfile() {
  return useMutation({
    mutationFn: userApi.updateProfile,
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: userApi.uploadAvatar,
  });
}
