'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject,
  pauseProject,
  resumeProject,
  type ProjectsListParams,
} from '@/lib/api/projects';
import type { CreateProject, UpdateProject, Project } from '@/lib/schemas';
import { mockProjects } from '@/lib/mock-data';

// Use mock data when API fails or configured
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ProjectsListParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// =============================================================================
// Queries
// =============================================================================

export function useProjects(params?: ProjectsListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      if (USE_MOCK) {
        // Filter by status if provided
        let filtered = mockProjects;
        if (params?.status) {
          filtered = mockProjects.filter(p => p.status === params.status);
        }
        return { items: filtered, total: filtered.length, limit: 20, offset: 0 };
      }
      return listProjects(params);
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      if (USE_MOCK) {
        const project = mockProjects.find(p => p.id === projectId);
        if (project) return project;
        throw new Error('Project not found');
      }
      return getProject(projectId);
    },
    enabled: !!projectId,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProject) => {
      if (USE_MOCK) {
        // Mock creation
        const newProject: Project = {
          id: `proj-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Ideally we would add to mockProjects here but it's read-only
        // So we just return success and let the UI update optimistically if possible
        return newProject;
      }
      return createProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProject) => {
      if (USE_MOCK) {
        const existing = mockProjects.find(p => p.id === projectId);
        if (!existing) throw new Error('Project not found');
        return { ...existing, ...data, updatedAt: new Date() } as Project;
      }
      return updateProject(projectId, data);
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (USE_MOCK) {
        return;
      }
      return deleteProject(projectId);
    },
    onSuccess: (_, projectId) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function usePauseProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => pauseProject(projectId),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useResumeProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => resumeProject(projectId),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
