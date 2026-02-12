/**
 * Agents API
 */

import { getApiClient } from './client';
import type { Agent, CreateAgent, UpdateAgent } from '@/lib/schemas';

export interface AgentsListParams {
  projectId: string;
  status?: 'active' | 'paused' | 'error';
  limit?: number;
  offset?: number;
}

export interface AgentsListResponse {
  items: Agent[];
  total: number;
  limit: number;
  offset: number;
}

export async function listAgents(params: AgentsListParams): Promise<AgentsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  
  const query = searchParams.toString();
  const path = query 
    ? `/projects/${params.projectId}/agents?${query}` 
    : `/projects/${params.projectId}/agents`;
  
  return getApiClient().get<AgentsListResponse>(path);
}

export async function getAgent(projectId: string, agentId: string): Promise<Agent> {
  return getApiClient().get<Agent>(`/projects/${projectId}/agents/${agentId}`);
}

export async function createAgent(projectId: string, data: CreateAgent): Promise<Agent> {
  return getApiClient().post<Agent>(`/projects/${projectId}/agents`, data);
}

export async function updateAgent(
  projectId: string, 
  agentId: string, 
  data: UpdateAgent
): Promise<Agent> {
  return getApiClient().patch<Agent>(`/projects/${projectId}/agents/${agentId}`, data);
}

export async function deleteAgent(projectId: string, agentId: string): Promise<void> {
  return getApiClient().delete<void>(`/projects/${projectId}/agents/${agentId}`);
}

export async function pauseAgent(projectId: string, agentId: string): Promise<Agent> {
  return getApiClient().post<Agent>(`/projects/${projectId}/agents/${agentId}/pause`);
}

export async function resumeAgent(projectId: string, agentId: string): Promise<Agent> {
  return getApiClient().post<Agent>(`/projects/${projectId}/agents/${agentId}/resume`);
}
