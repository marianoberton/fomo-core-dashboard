/**
 * Mock Data for Nexus Dashboard
 * 
 * Realistic data for testing without a backend
 */

import type { 
  Project, 
  Agent, 
  PromptLayer,
  Approval,
  Session,
} from './schemas';

// =============================================================================
// Projects
// =============================================================================

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Cartones del Sur - Ventas',
    clientName: 'Cartones del Sur S.A.',
    description: 'Agente de ventas para consultas de productos y cotizaciones',
    status: 'active',
    industry: 'manufacturing',
    dailyBudgetUsd: 15,
    monthlyBudgetUsd: 300,
    maxTurnsPerSession: 25,
    maxConcurrentSessions: 10,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'proj-002',
    name: 'TechFlow - Soporte',
    clientName: 'TechFlow Solutions',
    description: 'Agente de soporte técnico para clientes SaaS',
    status: 'active',
    industry: 'saas',
    dailyBudgetUsd: 25,
    monthlyBudgetUsd: 500,
    maxTurnsPerSession: 30,
    maxConcurrentSessions: 20,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-09T11:00:00Z',
  },
  {
    id: 'proj-003',
    name: 'Inmobiliaria Costa - Leads',
    clientName: 'Inmobiliaria Costa',
    description: 'Calificación de leads y agendamiento de visitas',
    status: 'paused',
    industry: 'real-estate',
    dailyBudgetUsd: 10,
    monthlyBudgetUsd: 200,
    maxTurnsPerSession: 15,
    maxConcurrentSessions: 5,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
  },
];

// =============================================================================
// Agents
// =============================================================================

export const mockAgents: Record<string, Agent[]> = {
  'proj-001': [
    {
      id: 'agent-001',
      projectId: 'proj-001',
      name: 'Sol',
      description: 'Asistente de ventas especializada en productos de cartón corrugado',
      status: 'active',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 4096,
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-02-10T14:30:00Z',
    },
    {
      id: 'agent-002',
      projectId: 'proj-001',
      name: 'Carlos',
      description: 'Agente de cotizaciones y seguimiento de pedidos',
      status: 'active',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.5,
      maxTokens: 4096,
      createdAt: '2026-01-20T11:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z',
    },
  ],
  'proj-002': [
    {
      id: 'agent-003',
      projectId: 'proj-002',
      name: 'Alex',
      description: 'Soporte técnico nivel 1 - Resolución de tickets comunes',
      status: 'active',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.3,
      maxTokens: 8192,
      createdAt: '2026-01-20T09:30:00Z',
      updatedAt: '2026-02-09T11:00:00Z',
    },
  ],
  'proj-003': [
    {
      id: 'agent-004',
      projectId: 'proj-003',
      name: 'Marina',
      description: 'Calificación de leads inmobiliarios',
      status: 'paused',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.6,
      maxTokens: 4096,
      createdAt: '2026-02-01T14:30:00Z',
      updatedAt: '2026-02-08T16:00:00Z',
    },
  ],
};

// =============================================================================
// Prompt Layers
// =============================================================================

export const mockPromptLayers: Record<string, PromptLayer[]> = {
  'proj-001': [
    {
      id: 'pl-001',
      projectId: 'proj-001',
      type: 'identity',
      content: `# Identidad

Sos Sol, la asistente virtual de ventas de Cartones del Sur.

## Personalidad
- Amable y profesional
- Usás el "vos" argentino
- Conocés todo el catálogo de productos
- Siempre buscás ayudar al cliente a encontrar la mejor solución

## Tono
Profesional pero cercano. Podés usar emojis con moderación.`,
      version: 2,
      isActive: true,
      changeReason: 'Ajuste de tono para ser más cercano',
      createdAt: '2026-02-05T10:00:00Z',
      createdBy: 'admin',
    },
    {
      id: 'pl-002',
      projectId: 'proj-001',
      type: 'identity',
      content: `# Identidad

Sos Sol, la asistente virtual de ventas de Cartones del Sur.

## Personalidad
- Profesional y formal
- Conocés todo el catálogo de productos`,
      version: 1,
      isActive: false,
      changeReason: 'Versión inicial',
      createdAt: '2026-01-15T10:00:00Z',
      createdBy: 'admin',
    },
    {
      id: 'pl-003',
      projectId: 'proj-001',
      type: 'instructions',
      content: `# Instrucciones

## Flujo Principal
1. Saludar al cliente
2. Identificar necesidad (tipo de caja, cantidad, uso)
3. Buscar productos en el catálogo
4. Ofrecer opciones con precios
5. Si acepta, generar cotización
6. Solicitar aprobación para enviar por email

## Herramientas
- \`search-products\`: Buscar en el catálogo
- \`generate-quote\`: Generar cotización PDF
- \`send-email\`: Enviar email (requiere aprobación)

## Upselling
Siempre ofrecer opciones de mayor calidad si el presupuesto lo permite.`,
      version: 3,
      isActive: true,
      changeReason: 'Agregado flujo de upselling',
      createdAt: '2026-02-08T14:00:00Z',
      createdBy: 'admin',
    },
    {
      id: 'pl-004',
      projectId: 'proj-001',
      type: 'safety',
      content: `# Restricciones de Seguridad

## NUNCA hacer
- Dar descuentos mayores al 10% sin aprobación
- Compartir información de otros clientes
- Hablar de la competencia
- Prometer tiempos de entrega sin verificar stock
- Enviar emails sin aprobación explícita

## Siempre hacer
- Verificar stock antes de confirmar disponibilidad
- Solicitar aprobación para acciones externas
- Escalar a humano si el cliente está frustrado`,
      version: 1,
      isActive: true,
      changeReason: 'Configuración inicial de safety',
      createdAt: '2026-01-15T11:00:00Z',
      createdBy: 'admin',
    },
  ],
};

// =============================================================================
// Approvals
// =============================================================================

export const mockApprovals: Approval[] = [
  {
    id: 'appr-001',
    sessionId: 'sess-abc123',
    projectId: 'proj-001',
    agentId: 'agent-001',
    tool: 'send-email',
    action: {
      to: 'juan@distribuidora.com',
      subject: 'Cotización Cartones del Sur - #2024-0892',
      preview: 'Adjunto la cotización solicitada para 2000 cajas CT-300R...',
    },
    status: 'pending',
    createdAt: '2026-02-11T00:45:00Z',
  },
  {
    id: 'appr-002',
    sessionId: 'sess-def456',
    projectId: 'proj-001',
    agentId: 'agent-002',
    tool: 'schedule-meeting',
    action: {
      title: 'Reunión seguimiento pedido #4521',
      date: '2026-02-12T15:00:00Z',
      attendees: ['cliente@empresa.com', 'ventas@cartonesdelsur.com'],
    },
    status: 'pending',
    createdAt: '2026-02-11T00:30:00Z',
  },
  {
    id: 'appr-003',
    sessionId: 'sess-ghi789',
    projectId: 'proj-002',
    agentId: 'agent-003',
    tool: 'create-ticket',
    action: {
      priority: 'high',
      title: 'Error de sincronización - Cliente Premium',
      description: 'El cliente reporta que los datos no se sincronizan hace 2 días...',
    },
    status: 'pending',
    createdAt: '2026-02-11T00:15:00Z',
  },
];

// =============================================================================
// Dashboard Stats
// =============================================================================

export const mockDashboardStats = {
  projectsCount: 3,
  activeAgentsCount: 4,
  activeSessionsCount: 12,
  pendingApprovalsCount: 3,
  todayCostUsd: 18.45,
  weekCostUsd: 86.20,
};

// =============================================================================
// Usage Data
// =============================================================================

export const mockUsageData = {
  daily: [
    { date: 'Lun', cost: 12.50, sessions: 45 },
    { date: 'Mar', cost: 18.30, sessions: 62 },
    { date: 'Mié', cost: 14.80, sessions: 51 },
    { date: 'Jue', cost: 22.20, sessions: 78 },
    { date: 'Vie', cost: 16.40, sessions: 58 },
    { date: 'Sáb', cost: 8.20, sessions: 32 },
    { date: 'Dom', cost: 5.80, sessions: 25 },
  ],
  byAgent: [
    { name: 'Sol', cost: 45.20, sessions: 234 },
    { name: 'Carlos', cost: 28.50, sessions: 156 },
    { name: 'Alex', cost: 22.30, sessions: 127 },
    { name: 'Marina', cost: 8.30, sessions: 42 },
  ],
};

// =============================================================================
// Recent Activity
// =============================================================================

export const mockRecentActivity = [
  { time: '00:45', agent: 'Sol', event: 'Cotización enviada', cost: 0.024 },
  { time: '00:42', agent: 'Sol', event: 'Sesión completada', cost: 0.018 },
  { time: '00:38', agent: 'Alex', event: 'Ticket escalado', cost: 0.012 },
  { time: '00:35', agent: 'Carlos', event: 'Sesión completada', cost: 0.021 },
  { time: '00:30', agent: 'Sol', event: 'Approval pending', cost: null },
  { time: '00:28', agent: 'Alex', event: 'Sesión iniciada', cost: null },
];
