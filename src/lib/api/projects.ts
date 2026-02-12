/**
 * Projects API
 */

import { getApiClient } from './client';
import type { Project, CreateProject, UpdateProject } from '@/lib/schemas';

export interface ProjectsListParams {
  status?: 'active' | 'paused' | 'archived';
  limit?: number;
  offset?: number;
}

export interface ProjectsListResponse {
  items: Project[];
  total: number;
  limit: number;
  offset: number;
}

export async function listProjects(params?: ProjectsListParams): Promise<ProjectsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  
  const query = searchParams.toString();
  const path = query ? `/projects?${query}` : '/projects';
  
  return getApiClient().get<ProjectsListResponse>(path);
}

export async function getProject(projectId: string): Promise<Project> {
  return getApiClient().get<Project>(`/projects/${projectId}`);
}

export async function createProject(data: CreateProject): Promise<Project> {
  return getApiClient().post<Project>('/projects', data);
}

export async function updateProject(projectId: string, data: UpdateProject): Promise<Project> {
  return getApiClient().patch<Project>(`/projects/${projectId}`, data);
}

export async function deleteProject(projectId: string): Promise<void> {
  return getApiClient().delete<void>(`/projects/${projectId}`);
}

export async function pauseProject(projectId: string): Promise<Project> {
  return getApiClient().post<Project>(`/projects/${projectId}/pause`);
}

export async function resumeProject(projectId: string): Promise<Project> {
  return getApiClient().post<Project>(`/projects/${projectId}/resume`);
}
