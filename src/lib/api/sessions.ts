/**
 * Sessions API
 */

import { getApiClient } from './client';
import type { Session, SessionStatus, TraceEvent } from '@/lib/schemas';

export interface SessionsListParams {
  projectId: string;
  agentId?: string;
  status?: SessionStatus;
  limit?: number;
  offset?: number;
}

export interface SessionsListResponse {
  items: Session[];
  total: number;
  limit: number;
  offset: number;
}

export async function listSessions(params: SessionsListParams): Promise<SessionsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.agentId) searchParams.set('agentId', params.agentId);
  if (params.status) searchParams.set('status', params.status);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  
  const query = searchParams.toString();
  const path = query 
    ? `/projects/${params.projectId}/sessions?${query}` 
    : `/projects/${params.projectId}/sessions`;
  
  return getApiClient().get<SessionsListResponse>(path);
}

export async function getSession(projectId: string, sessionId: string): Promise<Session> {
  return getApiClient().get<Session>(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function getSessionTraces(
  projectId: string, 
  sessionId: string,
  limit?: number
): Promise<TraceEvent[]> {
  const query = limit ? `?limit=${limit}` : '';
  return getApiClient().get<TraceEvent[]>(
    `/projects/${projectId}/sessions/${sessionId}/traces${query}`
  );
}

export async function terminateSession(projectId: string, sessionId: string): Promise<Session> {
  return getApiClient().post<Session>(`/projects/${projectId}/sessions/${sessionId}/terminate`);
}

export interface CreateSessionParams {
  projectId: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export async function createSession(params: CreateSessionParams): Promise<Session> {
  return getApiClient().post<Session>(`/projects/${params.projectId}/sessions`, {
    agentId: params.agentId,
    metadata: params.metadata,
  });
}
