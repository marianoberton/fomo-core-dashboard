'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listApprovals, 
  getApproval,
  approveApproval,
  denyApproval,
  getPendingApprovalsCount,
  type ApprovalsListParams,
} from '@/lib/api/approvals';
import { mockApprovals } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Query keys
export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  list: (params?: ApprovalsListParams) => [...approvalKeys.lists(), params] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (id: string) => [...approvalKeys.details(), id] as const,
  pendingCount: () => [...approvalKeys.all, 'pending-count'] as const,
};

// =============================================================================
// Queries
// =============================================================================

export function useApprovals(params?: ApprovalsListParams) {
  return useQuery({
    queryKey: approvalKeys.list(params),
    queryFn: async () => {
      if (USE_MOCK) {
        let filtered = mockApprovals;
        if (params?.status) {
          filtered = mockApprovals.filter(a => a.status === params.status);
        }
        if (params?.projectId) {
          filtered = filtered.filter(a => a.projectId === params.projectId);
        }
        return { items: filtered, total: filtered.length, limit: 20, offset: 0 };
      }
      return listApprovals(params);
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function usePendingApprovals() {
  return useApprovals({ status: 'pending' });
}

export function useApproval(approvalId: string) {
  return useQuery({
    queryKey: approvalKeys.detail(approvalId),
    queryFn: () => getApproval(approvalId),
    enabled: !!approvalId,
  });
}

export function usePendingApprovalsCount() {
  return useQuery({
    queryKey: approvalKeys.pendingCount(),
    queryFn: async () => {
      if (USE_MOCK) {
        return mockApprovals.filter(a => a.status === 'pending').length;
      }
      return getPendingApprovalsCount();
    },
    refetchInterval: 10000,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useApproveApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) => 
      approveApproval(approvalId, note),
    onSuccess: (updatedApproval) => {
      queryClient.setQueryData(approvalKeys.detail(updatedApproval.id), updatedApproval);
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.pendingCount() });
    },
    // Optimistic update
    onMutate: async ({ approvalId }) => {
      await queryClient.cancelQueries({ queryKey: approvalKeys.lists() });
      
      const previousData = queryClient.getQueryData(approvalKeys.list({ status: 'pending' }));
      
      // Optimistically remove from pending list
      queryClient.setQueryData(
        approvalKeys.list({ status: 'pending' }),
        (old: { items: Array<{ id: string }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== approvalId),
            total: old.items.length - 1,
          };
        }
      );
      
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(approvalKeys.list({ status: 'pending' }), context.previousData);
      }
    },
  });
}

export function useDenyApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) => 
      denyApproval(approvalId, note),
    onSuccess: (updatedApproval) => {
      queryClient.setQueryData(approvalKeys.detail(updatedApproval.id), updatedApproval);
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.pendingCount() });
    },
    // Optimistic update (same as approve)
    onMutate: async ({ approvalId }) => {
      await queryClient.cancelQueries({ queryKey: approvalKeys.lists() });
      
      const previousData = queryClient.getQueryData(approvalKeys.list({ status: 'pending' }));
      
      queryClient.setQueryData(
        approvalKeys.list({ status: 'pending' }),
        (old: { items: Array<{ id: string }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== approvalId),
            total: old.items.length - 1,
          };
        }
      );
      
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(approvalKeys.list({ status: 'pending' }), context.previousData);
      }
    },
  });
}
