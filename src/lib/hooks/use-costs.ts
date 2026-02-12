'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getProjectUsage,
  getProjectUsageByAgent,
  getDashboardOverview,
  getCostAlerts,
  type UsageParams,
} from '@/lib/api/costs';

// Query keys
export const costKeys = {
  all: ['costs'] as const,
  usage: () => [...costKeys.all, 'usage'] as const,
  projectUsage: (params: UsageParams) => [...costKeys.usage(), params] as const,
  projectUsageByAgent: (projectId: string, period?: string) => 
    [...costKeys.usage(), 'by-agent', projectId, period] as const,
  overview: () => [...costKeys.all, 'overview'] as const,
  alerts: () => [...costKeys.all, 'alerts'] as const,
  projectAlerts: (projectId: string) => [...costKeys.alerts(), projectId] as const,
};

// =============================================================================
// Queries
// =============================================================================

export function useProjectUsage(params: UsageParams) {
  return useQuery({
    queryKey: costKeys.projectUsage(params),
    queryFn: () => getProjectUsage(params),
    enabled: !!params.projectId,
  });
}

export function useProjectUsageByAgent(projectId: string, period?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: costKeys.projectUsageByAgent(projectId, period),
    queryFn: () => getProjectUsageByAgent(projectId, period),
    enabled: !!projectId,
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: costKeys.overview(),
    queryFn: () => getDashboardOverview(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCostAlerts(projectId?: string) {
  return useQuery({
    queryKey: projectId ? costKeys.projectAlerts(projectId) : costKeys.alerts(),
    queryFn: () => getCostAlerts(projectId),
    refetchInterval: 60000, // Refresh every minute
  });
}
