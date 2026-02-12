/**
 * API Module Exports
 */

// Client
export { 
  createApiClient, 
  getApiClient, 
  setApiKey, 
  clearApiKey, 
  isAuthenticated,
  ApiError,
  type ApiClient,
  type ApiClientConfig,
} from './client';

// Projects
export * from './projects';

// Agents
export * from './agents';

// Prompt Layers
export * from './prompts';

// Sessions
export * from './sessions';

// Approvals
export * from './approvals';

// Scheduled Tasks
export * from './tasks';

// Integrations (Credentials, MCP, Channels)
export * from './integrations';

// Costs & Usage
export * from './costs';
