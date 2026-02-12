/**
 * Approvals API
 */

import { getApiClient } from './client';
import type { Approval, ApprovalStatus, ApprovalDecision } from '@/lib/schemas';

export interface ApprovalsListParams {
  projectId?: string;
  agentId?: string;
  status?: ApprovalStatus;
  limit?: number;
  offset?: number;
}

export interface ApprovalsListResponse {
  items: Approval[];
  total: number;
  limit: number;
  offset: number;
}

export async function listApprovals(params?: ApprovalsListParams): Promise<ApprovalsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.projectId) searchParams.set('projectId', params.projectId);
  if (params?.agentId) searchParams.set('agentId', params.agentId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  
  const query = searchParams.toString();
  const path = query ? `/approvals?${query}` : '/approvals';
  
  return getApiClient().get<ApprovalsListResponse>(path);
}

export async function getApproval(approvalId: string): Promise<Approval> {
  return getApiClient().get<Approval>(`/approvals/${approvalId}`);
}

export async function decideApproval(
  approvalId: string, 
  decision: ApprovalDecision
): Promise<Approval> {
  return getApiClient().post<Approval>(`/approvals/${approvalId}/decide`, decision);
}

export async function approveApproval(approvalId: string, note?: string): Promise<Approval> {
  return decideApproval(approvalId, { approved: true, note });
}

export async function denyApproval(approvalId: string, note?: string): Promise<Approval> {
  return decideApproval(approvalId, { approved: false, note });
}

export async function getPendingApprovalsCount(): Promise<number> {
  const response = await listApprovals({ status: 'pending', limit: 1 });
  return response.total;
}
