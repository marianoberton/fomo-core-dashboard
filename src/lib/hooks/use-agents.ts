'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listAgents, 
  getAgent, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  pauseAgent,
  resumeAgent,
  type AgentsListParams,
} from '@/lib/api/agents';
import type { CreateAgent, UpdateAgent } from '@/lib/schemas';
import { mockAgents } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params: AgentsListParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (projectId: string, agentId: string) => [...agentKeys.details(), projectId, agentId] as const,
};

// =============================================================================
// Queries
// =============================================================================

export function useAgents(params: AgentsListParams) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      if (USE_MOCK) {
        const agents = mockAgents[params.projectId] || [];
        return { items: agents, total: agents.length, limit: 20, offset: 0 };
      }
      return listAgents(params);
    },
    enabled: !!params.projectId,
  });
}

export function useAgent(projectId: string, agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(projectId, agentId),
    queryFn: async () => {
      if (USE_MOCK) {
        const agents = mockAgents[projectId] || [];
        const agent = agents.find(a => a.id === agentId);
        if (agent) return agent;
        throw new Error('Agent not found');
      }
      return getAgent(projectId, agentId);
    },
    enabled: !!projectId && !!agentId,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useCreateAgent(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAgent) => createAgent(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

export function useUpdateAgent(projectId: string, agentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateAgent) => updateAgent(projectId, agentId, data),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(agentKeys.detail(projectId, agentId), updatedAgent);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

export function useDeleteAgent(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(projectId, agentId),
    onSuccess: (_, agentId) => {
      queryClient.removeQueries({ queryKey: agentKeys.detail(projectId, agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

export function usePauseAgent(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => pauseAgent(projectId, agentId),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(agentKeys.detail(projectId, updatedAgent.id), updatedAgent);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

export function useResumeAgent(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => resumeAgent(projectId, agentId),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(agentKeys.detail(projectId, updatedAgent.id), updatedAgent);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}
