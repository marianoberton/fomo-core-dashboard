/**
 * Zod schemas for Nexus Core API types
 *
 * These mirror the backend schemas for client-side validation
 * and type inference. Aligned with the actual Nexus Core backend shapes.
 */

import { z } from 'zod';

// =============================================================================
// Base Types
// =============================================================================

// Backend uses nanoid, not UUIDs
export const IdSchema = z.string().min(1);

export const TimestampSchema = z.coerce.date();

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  });

// =============================================================================
// Project Schemas
// =============================================================================

export const ProjectStatusSchema = z.enum(['active', 'paused', 'deleted']);

export const ProjectSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  owner: z.string(),
  tags: z.array(z.string()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  status: ProjectStatusSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  owner: z.string().min(1).max(200),
  tags: z.array(z.string()).optional(),
  config: z.record(z.string(), z.unknown()),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  tags: z.array(z.string()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  status: ProjectStatusSchema.optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// =============================================================================
// Agent Schemas
// =============================================================================

export const AgentStatusSchema = z.enum(['active', 'paused', 'disabled']);

export const AgentPromptConfigSchema = z.object({
  identity: z.string(),
  instructions: z.string(),
  safety: z.string(),
});

export const AgentLimitsSchema = z.object({
  maxTurns: z.number().int(),
  maxTokensPerTurn: z.number().int(),
  budgetPerDayUsd: z.number(),
});

export const AgentSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: AgentStatusSchema,
  promptConfig: AgentPromptConfigSchema,
  toolAllowlist: z.array(z.string()),
  mcpServers: z.array(z.record(z.string(), z.unknown())).optional(),
  channelConfig: z.record(z.string(), z.unknown()).optional(),
  limits: AgentLimitsSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  promptConfig: AgentPromptConfigSchema,
  toolAllowlist: z.array(z.string()).optional(),
  limits: AgentLimitsSchema.partial().optional(),
});

export const UpdateAgentSchema = CreateAgentSchema.partial();

export type Agent = z.infer<typeof AgentSchema>;
export type CreateAgent = z.infer<typeof CreateAgentSchema>;
export type UpdateAgent = z.infer<typeof UpdateAgentSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

// =============================================================================
// Prompt Layer Schemas
// =============================================================================

export const PromptLayerTypeSchema = z.enum(['identity', 'instructions', 'safety']);

export const PromptLayerSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  type: PromptLayerTypeSchema,
  content: z.string(),
  version: z.number().int().min(1),
  isActive: z.boolean(),
  changeReason: z.string().optional(),
  createdAt: TimestampSchema,
  createdBy: z.string().optional(),
});

export const CreatePromptLayerSchema = z.object({
  type: PromptLayerTypeSchema,
  content: z.string(),
  changeReason: z.string().optional(),
});

export type PromptLayer = z.infer<typeof PromptLayerSchema>;
export type CreatePromptLayer = z.infer<typeof CreatePromptLayerSchema>;
export type PromptLayerType = z.infer<typeof PromptLayerTypeSchema>;

// =============================================================================
// Session Schemas
// =============================================================================

export const SessionStatusSchema = z.enum(['active', 'paused', 'closed', 'expired']);

export const SessionSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  status: SessionStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  expiresAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Session = z.infer<typeof SessionSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

// =============================================================================
// Approval Schemas
// =============================================================================

export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'denied', 'expired']);

export const ApprovalSchema = z.object({
  id: IdSchema,
  sessionId: IdSchema,
  projectId: IdSchema,
  toolId: z.string(),
  toolInput: z.unknown(),
  riskLevel: z.string().optional(),
  status: ApprovalStatusSchema,
  resolvedBy: z.string().optional(),
  resolvedAt: TimestampSchema.optional(),
  note: z.string().optional(),
  expiresAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
});

export const ApprovalDecisionSchema = z.object({
  approved: z.boolean(),
  note: z.string().optional(),
});

export type Approval = z.infer<typeof ApprovalSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

// =============================================================================
// Scheduled Task Schemas
// =============================================================================

export const ScheduledTaskStatusSchema = z.enum([
  'proposed', 'active', 'paused', 'completed', 'rejected',
]);

export const ScheduledTaskSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  cronExpression: z.string(),
  taskPayload: z.record(z.string(), z.unknown()),
  status: ScheduledTaskStatusSchema,
  origin: z.enum(['api', 'agent']).optional(),
  lastRunAt: TimestampSchema.optional(),
  nextRunAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const CreateScheduledTaskSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cronExpression: z.string(),
  taskPayload: z.record(z.string(), z.unknown()),
});

export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;
export type CreateScheduledTask = z.infer<typeof CreateScheduledTaskSchema>;
export type ScheduledTaskStatus = z.infer<typeof ScheduledTaskStatusSchema>;

// =============================================================================
// Integration Schemas (Credentials, MCP, Channels)
// =============================================================================

export const CredentialSchema = z.object({
  key: z.string().min(1).max(100),
  maskedValue: z.string(), // Always masked for security
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const CreateCredentialSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
});

export const McpServerTypeSchema = z.enum(['stdio', 'http']);

export const McpServerSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  name: z.string().min(1).max(100),
  type: McpServerTypeSchema,
  command: z.string().optional(), // For stdio
  url: z.string().url().optional(), // For http
  enabled: z.boolean(),
  status: z.enum(['connected', 'disconnected', 'error']),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const CreateMcpServerSchema = z.object({
  name: z.string().min(1).max(100),
  type: McpServerTypeSchema,
  command: z.string().optional(),
  url: z.string().url().optional(),
  enabled: z.boolean().default(true),
});

export const ChannelTypeSchema = z.enum(['whatsapp', 'telegram', 'slack', 'email']);

export const ChannelSchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  type: ChannelTypeSchema,
  name: z.string(),
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean(),
  status: z.enum(['connected', 'disconnected', 'error']),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Credential = z.infer<typeof CredentialSchema>;
export type CreateCredential = z.infer<typeof CreateCredentialSchema>;
export type McpServer = z.infer<typeof McpServerSchema>;
export type CreateMcpServer = z.infer<typeof CreateMcpServerSchema>;
export type McpServerType = z.infer<typeof McpServerTypeSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type ChannelType = z.infer<typeof ChannelTypeSchema>;

// =============================================================================
// Cost & Usage Schemas
// =============================================================================

export const UsageRecordSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  projectId: IdSchema,
  agentId: IdSchema.optional(),
  sessionsCount: z.number().int().min(0),
  tokensIn: z.number().int().min(0),
  tokensOut: z.number().int().min(0),
  costUsd: z.number().min(0),
});

export const UsageSummarySchema = z.object({
  period: z.enum(['day', 'week', 'month']),
  totalCostUsd: z.number().min(0),
  totalTokensIn: z.number().int().min(0),
  totalTokensOut: z.number().int().min(0),
  totalSessions: z.number().int().min(0),
  dailyBreakdown: z.array(UsageRecordSchema),
});

export type UsageRecord = z.infer<typeof UsageRecordSchema>;
export type UsageSummary = z.infer<typeof UsageSummarySchema>;

// =============================================================================
// Trace Schemas
// =============================================================================

export const TraceEventTypeSchema = z.enum([
  'session_start',
  'session_end',
  'message_received',
  'message_sent',
  'tool_call_start',
  'tool_call_end',
  'approval_requested',
  'approval_decided',
  'error',
]);

export const TraceEventSchema = z.object({
  id: IdSchema,
  sessionId: IdSchema,
  type: TraceEventTypeSchema,
  data: z.unknown(),
  timestamp: TimestampSchema,
});

export type TraceEvent = z.infer<typeof TraceEventSchema>;
export type TraceEventType = z.infer<typeof TraceEventTypeSchema>;

// =============================================================================
// Dashboard Overview Schema
// =============================================================================

export const DashboardOverviewSchema = z.object({
  projectsCount: z.number().int().min(0),
  activeAgentsCount: z.number().int().min(0),
  activeSessionsCount: z.number().int().min(0),
  pendingApprovalsCount: z.number().int().min(0),
  todayCostUsd: z.number().min(0),
  weekCostUsd: z.number().min(0),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
