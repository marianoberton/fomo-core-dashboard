/**
 * Costs & Usage API
 */

import { getApiClient } from './client';
import type { UsageSummary, UsageRecord, DashboardOverview } from '@/lib/schemas';

export interface UsageParams {
  projectId: string;
  period?: 'day' | 'week' | 'month';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  agentId?: string;
}

export async function getProjectUsage(params: UsageParams): Promise<UsageSummary> {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set('period', params.period);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.agentId) searchParams.set('agentId', params.agentId);
  
  const query = searchParams.toString();
  const path = query 
    ? `/projects/${params.projectId}/usage?${query}` 
    : `/projects/${params.projectId}/usage`;
  
  return getApiClient().get<UsageSummary>(path);
}

export async function getProjectUsageByAgent(
  projectId: string,
  period?: 'day' | 'week' | 'month'
): Promise<Record<string, UsageRecord[]>> {
  const query = period ? `?period=${period}` : '';
  return getApiClient().get<Record<string, UsageRecord[]>>(
    `/projects/${projectId}/usage/by-agent${query}`
  );
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return getApiClient().get<DashboardOverview>('/dashboard/overview');
}

export interface CostAlert {
  id: string;
  projectId: string;
  type: 'daily_budget' | 'monthly_budget';
  threshold: number;
  currentSpend: number;
  percent: number;
  triggeredAt: string;
  acknowledged: boolean;
}

export async function getCostAlerts(projectId?: string): Promise<CostAlert[]> {
  const query = projectId ? `?projectId=${projectId}` : '';
  return getApiClient().get<CostAlert[]>(`/cost-alerts${query}`);
}

export async function acknowledgeCostAlert(alertId: string): Promise<CostAlert> {
  return getApiClient().post<CostAlert>(`/cost-alerts/${alertId}/acknowledge`);
}
