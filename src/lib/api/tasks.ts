/**
 * Scheduled Tasks API
 */

import { getApiClient } from './client';
import type { ScheduledTask, CreateScheduledTask } from '@/lib/schemas';

export interface TasksListParams {
  projectId: string;
  agentId?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface TasksListResponse {
  items: ScheduledTask[];
  total: number;
  limit: number;
  offset: number;
}

export interface TaskRunHistory {
  id: string;
  taskId: string;
  status: 'success' | 'error' | 'timeout';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  error?: string;
  sessionId?: string;
}

export async function listTasks(params: TasksListParams): Promise<TasksListResponse> {
  const searchParams = new URLSearchParams();
  if (params.agentId) searchParams.set('agentId', params.agentId);
  if (params.enabled !== undefined) searchParams.set('enabled', params.enabled.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  
  const query = searchParams.toString();
  const path = query 
    ? `/projects/${params.projectId}/tasks?${query}` 
    : `/projects/${params.projectId}/tasks`;
  
  return getApiClient().get<TasksListResponse>(path);
}

export async function getTask(projectId: string, taskId: string): Promise<ScheduledTask> {
  return getApiClient().get<ScheduledTask>(`/projects/${projectId}/tasks/${taskId}`);
}

export async function createTask(
  projectId: string, 
  data: CreateScheduledTask
): Promise<ScheduledTask> {
  return getApiClient().post<ScheduledTask>(`/projects/${projectId}/tasks`, data);
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<CreateScheduledTask>
): Promise<ScheduledTask> {
  return getApiClient().patch<ScheduledTask>(`/projects/${projectId}/tasks/${taskId}`, data);
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  return getApiClient().delete<void>(`/projects/${projectId}/tasks/${taskId}`);
}

export async function enableTask(projectId: string, taskId: string): Promise<ScheduledTask> {
  return getApiClient().post<ScheduledTask>(`/projects/${projectId}/tasks/${taskId}/enable`);
}

export async function disableTask(projectId: string, taskId: string): Promise<ScheduledTask> {
  return getApiClient().post<ScheduledTask>(`/projects/${projectId}/tasks/${taskId}/disable`);
}

export async function runTaskNow(projectId: string, taskId: string): Promise<{ sessionId: string }> {
  return getApiClient().post<{ sessionId: string }>(`/projects/${projectId}/tasks/${taskId}/run`);
}

export async function getTaskHistory(
  projectId: string, 
  taskId: string,
  limit?: number
): Promise<TaskRunHistory[]> {
  const query = limit ? `?limit=${limit}` : '';
  return getApiClient().get<TaskRunHistory[]>(
    `/projects/${projectId}/tasks/${taskId}/history${query}`
  );
}
