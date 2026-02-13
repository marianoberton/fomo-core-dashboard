'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listPromptLayers, 
  getPromptLayer, 
  createPromptLayer, 
  activatePromptLayer, 
  type PromptLayersListParams 
} from '@/lib/api/prompts';
import type { CreatePromptLayer, PromptLayer } from '@/lib/schemas';
import { mockPromptLayers } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Query keys
export const promptKeys = {
  all: ['prompt-layers'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  list: (params: PromptLayersListParams) => [...promptKeys.lists(), params] as const,
  details: () => [...promptKeys.all, 'detail'] as const,
  detail: (projectId: string, layerId: string) => [...promptKeys.details(), projectId, layerId] as const,
};

// =============================================================================
// Queries
// =============================================================================

export function usePromptLayers(params: PromptLayersListParams) {
  return useQuery({
    queryKey: promptKeys.list(params),
    queryFn: async () => {
      if (USE_MOCK) {
        let layers = mockPromptLayers[params.projectId] || [];
        if (params.type) {
          layers = layers.filter(l => l.type === params.type);
        }
        return layers;
      }
      return listPromptLayers(params);
    },
    enabled: !!params.projectId,
  });
}

export function usePromptLayer(projectId: string, layerId: string) {
  return useQuery({
    queryKey: promptKeys.detail(projectId, layerId),
    queryFn: async () => {
      if (USE_MOCK) {
        const layers = mockPromptLayers[projectId] || [];
        const layer = layers.find(l => l.id === layerId);
        if (layer) return layer;
        throw new Error('Prompt layer not found');
      }
      return getPromptLayer(projectId, layerId);
    },
    enabled: !!projectId && !!layerId,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useCreatePromptLayer(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePromptLayer) => {
      if (USE_MOCK) {
        // Mock creation
        const layers = mockPromptLayers[projectId] || [];
        const lastVersion = layers
          .filter(l => l.type === data.type)
          .reduce((max, l) => Math.max(max, l.version), 0);
          
        const newLayer: PromptLayer = {
          id: `pl-${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          type: data.type,
          content: data.content,
          version: lastVersion + 1,
          isActive: false, // New layers are not active by default usually? Or maybe they are? API doesn't specify but usually explicit activation
          changeReason: data.changeReason,
          createdAt: new Date(),
          createdBy: 'user', // Mock user
        };
        
        // In a real mock implementation we'd add to the array, but it's readonly. 
        // We'll return it and let optimistic updates handle it if implemented, 
        // or just rely on the success callback invalidating queries (which won't return the new item from the static mock data)
        // To make the UI update nicely in mock mode without a mutable store, we might need a mutable mock store.
        // For now, let's just return the new layer.
        return newLayer;
      }
      return createPromptLayer(projectId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}

export function useActivatePromptLayer(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (layerId: string) => {
      if (USE_MOCK) {
        const layers = mockPromptLayers[projectId] || [];
        const layer = layers.find(l => l.id === layerId);
        if (!layer) throw new Error('Layer not found');
        
        // In a real backend, this would set other layers of same type to inactive
        return { ...layer, isActive: true };
      }
      return activatePromptLayer(projectId, layerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}
