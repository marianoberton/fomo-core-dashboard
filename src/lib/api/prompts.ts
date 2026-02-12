/**
 * Prompt Layers API
 */

import { getApiClient } from './client';
import type { PromptLayer, CreatePromptLayer, PromptLayerType } from '@/lib/schemas';

export interface PromptLayersListParams {
  projectId: string;
  type?: PromptLayerType;
}

export async function listPromptLayers(params: PromptLayersListParams): Promise<PromptLayer[]> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  
  const query = searchParams.toString();
  const path = query 
    ? `/projects/${params.projectId}/prompt-layers?${query}` 
    : `/projects/${params.projectId}/prompt-layers`;
  
  return getApiClient().get<PromptLayer[]>(path);
}

export async function getActivePromptLayers(
  projectId: string
): Promise<Record<PromptLayerType, PromptLayer>> {
  return getApiClient().get<Record<PromptLayerType, PromptLayer>>(
    `/projects/${projectId}/prompt-layers/active`
  );
}

export async function getPromptLayer(projectId: string, layerId: string): Promise<PromptLayer> {
  return getApiClient().get<PromptLayer>(`/projects/${projectId}/prompt-layers/${layerId}`);
}

export async function createPromptLayer(
  projectId: string, 
  data: CreatePromptLayer
): Promise<PromptLayer> {
  return getApiClient().post<PromptLayer>(`/projects/${projectId}/prompt-layers`, data);
}

export async function activatePromptLayer(
  projectId: string, 
  layerId: string
): Promise<PromptLayer> {
  return getApiClient().post<PromptLayer>(
    `/projects/${projectId}/prompt-layers/${layerId}/activate`
  );
}

export async function comparePromptLayers(
  projectId: string,
  layerId1: string,
  layerId2: string
): Promise<{ layer1: PromptLayer; layer2: PromptLayer; diff: string }> {
  return getApiClient().get(
    `/projects/${projectId}/prompt-layers/compare?layer1=${layerId1}&layer2=${layerId2}`
  );
}
