/**
 * Integrations API (Credentials, MCP Servers, Channels)
 * 
 * NOTE: These APIs may not exist yet in Nexus Core.
 * Components should use mock data until the backend is ready.
 */

import { getApiClient } from './client';
import type { 
  Credential, 
  CreateCredential, 
  McpServer, 
  CreateMcpServer,
  Channel 
} from '@/lib/schemas';

// =============================================================================
// Credentials
// =============================================================================

export async function listCredentials(projectId: string): Promise<Credential[]> {
  // TODO: connect to real API when available
  return getApiClient().get<Credential[]>(`/projects/${projectId}/secrets`);
}

export async function createCredential(
  projectId: string, 
  data: CreateCredential
): Promise<Credential> {
  // TODO: connect to real API when available
  return getApiClient().post<Credential>(`/projects/${projectId}/secrets`, data);
}

export async function updateCredential(
  projectId: string,
  key: string,
  value: string
): Promise<Credential> {
  // TODO: connect to real API when available
  return getApiClient().put<Credential>(`/projects/${projectId}/secrets/${key}`, { value });
}

export async function deleteCredential(projectId: string, key: string): Promise<void> {
  // TODO: connect to real API when available
  return getApiClient().delete<void>(`/projects/${projectId}/secrets/${key}`);
}

// =============================================================================
// MCP Servers
// =============================================================================

export async function listMcpServers(projectId: string): Promise<McpServer[]> {
  // TODO: connect to real API when available
  return getApiClient().get<McpServer[]>(`/projects/${projectId}/mcp-servers`);
}

export async function getMcpServer(projectId: string, serverId: string): Promise<McpServer> {
  // TODO: connect to real API when available
  return getApiClient().get<McpServer>(`/projects/${projectId}/mcp-servers/${serverId}`);
}

export async function createMcpServer(
  projectId: string, 
  data: CreateMcpServer
): Promise<McpServer> {
  // TODO: connect to real API when available
  return getApiClient().post<McpServer>(`/projects/${projectId}/mcp-servers`, data);
}

export async function updateMcpServer(
  projectId: string,
  serverId: string,
  data: Partial<CreateMcpServer>
): Promise<McpServer> {
  // TODO: connect to real API when available
  return getApiClient().patch<McpServer>(`/projects/${projectId}/mcp-servers/${serverId}`, data);
}

export async function deleteMcpServer(projectId: string, serverId: string): Promise<void> {
  // TODO: connect to real API when available
  return getApiClient().delete<void>(`/projects/${projectId}/mcp-servers/${serverId}`);
}

export async function restartMcpServer(projectId: string, serverId: string): Promise<McpServer> {
  // TODO: connect to real API when available
  return getApiClient().post<McpServer>(`/projects/${projectId}/mcp-servers/${serverId}/restart`);
}

export async function healthCheckMcpServer(
  projectId: string, 
  serverId: string
): Promise<{ healthy: boolean; message?: string }> {
  // TODO: connect to real API when available
  return getApiClient().post(`/projects/${projectId}/mcp-servers/${serverId}/health`);
}

// =============================================================================
// Channels
// =============================================================================

export async function listChannels(projectId: string): Promise<Channel[]> {
  // TODO: connect to real API when available
  return getApiClient().get<Channel[]>(`/projects/${projectId}/channels`);
}

export async function getChannel(projectId: string, channelId: string): Promise<Channel> {
  // TODO: connect to real API when available
  return getApiClient().get<Channel>(`/projects/${projectId}/channels/${channelId}`);
}

export async function updateChannelConfig(
  projectId: string,
  channelId: string,
  config: Record<string, unknown>
): Promise<Channel> {
  // TODO: connect to real API when available
  return getApiClient().patch<Channel>(`/projects/${projectId}/channels/${channelId}`, { config });
}

export async function enableChannel(projectId: string, channelId: string): Promise<Channel> {
  // TODO: connect to real API when available
  return getApiClient().post<Channel>(`/projects/${projectId}/channels/${channelId}/enable`);
}

export async function disableChannel(projectId: string, channelId: string): Promise<Channel> {
  // TODO: connect to real API when available
  return getApiClient().post<Channel>(`/projects/${projectId}/channels/${channelId}/disable`);
}

export async function testChannel(
  projectId: string, 
  channelId: string
): Promise<{ success: boolean; message?: string }> {
  // TODO: connect to real API when available
  return getApiClient().post(`/projects/${projectId}/channels/${channelId}/test`);
}
