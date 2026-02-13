'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getProjectUsage,
  getProjectUsageByAgent,
  getDashboardOverview,
  getCostAlerts,
  type UsageParams,
} from '@/lib/api/costs';
import { mockUsageData, mockDashboardStats } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

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
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          totalCost: 125.40,
          currency: 'USD',
          period: 'last_7_days',
          breakdown: mockUsageData.daily,
        };
      }
      return getProjectUsage(params);
    },
    enabled: !!params.projectId,
  });
}

export function useProjectUsageByAgent(projectId: string, period?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: costKeys.projectUsageByAgent(projectId, period),
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          projectId,
          period: period || 'week',
          agents: mockUsageData.byAgent,
        };
      }
      return getProjectUsageByAgent(projectId, period);
    },
    enabled: !!projectId,
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: costKeys.overview(),
    queryFn: async () => {
      if (USE_MOCK) {
        return mockDashboardStats;
      }
      return getDashboardOverview();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCostAlerts(projectId?: string) {
  return useQuery({
    queryKey: projectId ? costKeys.projectAlerts(projectId) : costKeys.alerts(),
    queryFn: async () => {
      if (USE_MOCK) {
        return [
          {
            id: 'alert-001',
            projectId: 'proj-001',
            type: 'budget_exceeded',
            severity: 'warning',
            message: 'Daily budget 80% used',
            createdAt: new Date(),
            data: { threshold: 80, current: 85 }
          }
        ];
      }
      return getCostAlerts(projectId);
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
