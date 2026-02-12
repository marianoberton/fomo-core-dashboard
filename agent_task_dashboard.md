# AGENT-TASK: Nexus Dashboard

**Módulo:** `nexus-dashboard/`
**Branch:** `main` (repo separado)
**Prioridad:** CRÍTICA

---

## Contexto

Nexus Core es un framework de agentes IA autónomos. Tiene una API REST + WebSocket completa (Fastify) que expone toda la funcionalidad: proyectos, agentes, sesiones, prompt layers, scheduled tasks, aprobaciones, costos, y trazas.

Este dashboard es la interfaz web para **operadores de FOMO** (la consultora dueña de Nexus Core). Desde acá se crean, configuran, monitorean, y administran todos los agentes desplegados para clientes.

**URL de la API:** `${NEXUS_API_URL}` (env var, default: `http://localhost:3000`)

---

## Stack

| Componente | Tecnología | Justificación |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSR para dashboard, API routes como proxy |
| Language | TypeScript (strict) | Consistencia con el backend |
| UI Components | **shadcn/ui** | Componentes accesibles, customizables, no-vendor-lock |
| Styling | **Tailwind CSS v4** | Consistencia, utility-first |
| State | **TanStack Query v5** | Cache, invalidation, optimistic updates |
| Forms | **React Hook Form + Zod** | Validación client-side idéntica al backend |
| WebSocket | Native WebSocket API | Para chat en tiempo real y eventos |
| Charts | **Recharts** | Para métricas de costos y uso |
| Icons | **Lucide React** | Ya incluido en shadcn |
| Auth | API Key header | Simple, match con la API de Nexus Core |
| Code Editor | **Monaco Editor** (react) | Para editar prompt layers y configs |
| Package Manager | pnpm | Consistencia con backend |

---

## Estructura del Proyecto

```
nexus-dashboard/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout con sidebar
│   │   ├── page.tsx                      # Dashboard home (overview)
│   │   ├── login/
│   │   │   └── page.tsx                  # API key login
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx                  # Lista de proyectos
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Crear proyecto (onboarding wizard)
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx             # Overview del proyecto
│   │   │       ├── agents/
│   │   │       │   ├── page.tsx         # Lista de agentes del proyecto
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx     # Onboarding wizard de agente
│   │   │       │   └── [agentId]/
│   │   │       │       ├── page.tsx     # Config del agente
│   │   │       │       ├── chat/
│   │   │       │       │   └── page.tsx # Chat de prueba con el agente
│   │   │       │       └── logs/
│   │   │       │           └── page.tsx # Traces y ejecuciones
│   │   │       ├── prompts/
│   │   │       │   └── page.tsx         # Prompt layers (editor + versiones)
│   │   │       ├── integrations/
│   │   │       │   └── page.tsx         # Credenciales + MCP + Canales
│   │   │       ├── tasks/
│   │   │       │   └── page.tsx         # Scheduled tasks
│   │   │       └── costs/
│   │   │           └── page.tsx         # Costos y uso
│   │   │
│   │   └── approvals/
│   │       └── page.tsx                  # Aprobaciones pendientes (global)
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn components (auto-generated)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx              # Navegación principal
│   │   │   ├── header.tsx               # Top bar con breadcrumbs
│   │   │   └── page-shell.tsx           # Wrapper de página
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-status-badge.tsx
│   │   │   └── project-overview-stats.tsx
│   │   ├── agents/
│   │   │   ├── agent-card.tsx
│   │   │   ├── agent-config-form.tsx
│   │   │   └── onboarding-wizard.tsx    # Multi-step wizard
│   │   ├── prompts/
│   │   │   ├── prompt-editor.tsx        # Monaco editor wrapper
│   │   │   ├── prompt-layer-tabs.tsx    # identity | instructions | safety
│   │   │   ├── prompt-version-list.tsx
│   │   │   └── prompt-diff-viewer.tsx
│   │   ├── integrations/
│   │   │   ├── credentials-manager.tsx
│   │   │   ├── mcp-server-list.tsx
│   │   │   ├── mcp-server-form.tsx
│   │   │   └── channel-config.tsx
│   │   ├── chat/
│   │   │   ├── chat-window.tsx          # WebSocket chat
│   │   │   ├── chat-message.tsx
│   │   │   ├── chat-tool-call.tsx       # Visualización de tool calls
│   │   │   └── chat-approval-card.tsx   # Inline approval UI
│   │   ├── approvals/
│   │   │   ├── approval-card.tsx
│   │   │   └── approval-list.tsx
│   │   ├── costs/
│   │   │   ├── cost-overview.tsx
│   │   │   ├── cost-chart.tsx
│   │   │   └── usage-table.tsx
│   │   └── tasks/
│   │       ├── task-list.tsx
│   │       ├── task-form.tsx
│   │       └── task-run-history.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                # Fetch wrapper con auth
│   │   │   ├── projects.ts              # API calls de proyectos
│   │   │   ├── agents.ts                # API calls de agentes
│   │   │   ├── sessions.ts              # API calls de sesiones
│   │   │   ├── prompts.ts               # API calls de prompt layers
│   │   │   ├── tasks.ts                 # API calls de scheduled tasks
│   │   │   ├── approvals.ts             # API calls de aprobaciones
│   │   │   ├── integrations.ts          # API calls de credentials/MCP
│   │   │   └── costs.ts                 # API calls de costos/uso
│   │   ├── hooks/
│   │   │   ├── use-projects.ts          # TanStack Query hooks
│   │   │   ├── use-agents.ts
│   │   │   ├── use-sessions.ts
│   │   │   ├── use-prompts.ts
│   │   │   ├── use-approvals.ts
│   │   │   ├── use-costs.ts
│   │   │   ├── use-websocket.ts         # WebSocket connection hook
│   │   │   └── use-auth.ts              # API key auth
│   │   ├── websocket.ts                 # WebSocket client class
│   │   ├── schemas.ts                   # Zod schemas (mirror backend)
│   │   └── utils.ts                     # Formatters, helpers
│   │
│   └── styles/
│       └── globals.css                   # Tailwind base + custom vars
│
└── public/
    └── favicon.ico
```

---

## Diseño Visual

### Principios

- **Dark mode por default** — es un dashboard de operaciones, no un sitio público
- **Densidad media** — no demasiado espacioso (hay mucha info), no demasiado apretado
- **Colores:** Fondo oscuro (zinc-950), acentos en brand color de FOMO, estados con semántica (verde=activo, amarillo=pendiente, rojo=error)
- **Tipografía:** `JetBrains Mono` para código/datos, `Geist` para UI
- **Sin animaciones innecesarias** — transiciones suaves en hover y modales, nada más
- **Sidebar colapsable** — ícono + texto, se colapsa a solo íconos

### Layout Principal

```
┌─────────────────────────────────────────────────────────┐
│ ≡ NEXUS CORE                            🔔 3  👤 Admin │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│  📊    │  Breadcrumb: Projects > Cartones del Sur       │
│  Home  │                                                │
│        │  ┌──────────────────────────────────────────┐  │
│  📁    │  │                                          │  │
│  Projects  │          PAGE CONTENT                   │  │
│        │  │                                          │  │
│  ✅    │  │                                          │  │
│  Approvals │                                         │  │
│        │  │                                          │  │
│  ⚙️    │  │                                          │  │
│  Settings  │                                         │  │
│        │  └──────────────────────────────────────────┘  │
│        │                                                │
├────────┴────────────────────────────────────────────────┤
│ Nexus Core v1.0.0 · 3 projects · 7 agents · $12.40 today│
└─────────────────────────────────────────────────────────┘
```

---

## Páginas — Especificación Detallada

### 1. Dashboard Home (`/`)

Overview global de toda la instancia.

```
┌─────────────────────────────────────────────────────────┐
│ Nexus Core Dashboard                                     │
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Projects │ │ Agents   │ │ Sessions │ │ Cost     │    │
│ │    3     │ │    7     │ │   12     │ │ $12.40   │    │
│ │ active   │ │ active   │ │ active   │ │ today    │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                          │
│ Pending Approvals (3)                    [View All →]    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📧 send-email → juan@... │ sales │ 5m ago [✅][❌]│  │
│ │ 📅 schedule-meeting      │ sales │ 12m ago[✅][❌]│  │
│ │ 🔄 propose-task          │ ops   │ 1h ago [✅][❌]│  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Recent Activity                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 14:32 │ sales-agent │ Session completed │ $0.02    │  │
│ │ 14:28 │ support     │ Tool: query-crm   │ $0.01    │  │
│ │ 14:15 │ sales-agent │ Approval pending  │ —        │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Cost (last 7 days)                                       │
│ ┌────────────────────────────────────────────────────┐  │
│ │  $15 ┤     ╭─╮                                     │  │
│ │  $10 ┤ ╭───╯ ╰──╮                                 │  │
│ │   $5 ┤─╯        ╰──╮                              │  │
│ │   $0 ┤              ╰───                           │  │
│ │      └──Mon──Tue──Wed──Thu──Fri──Sat──Sun──        │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Data sources:**
- `GET /api/v1/projects` → count active
- `GET /api/v1/approvals` → pending list
- `GET /api/v1/projects/:id/usage` → cost data per project
- `GET /api/v1/projects/:id/traces?last=20` → recent activity

---

### 2. Projects List (`/projects`)

Grid de tarjetas, cada una con status, agent count, daily cost.

**Actions:** Create Project, Filter by status, Search

---

### 3. Onboarding Wizard (`/projects/new`)

**CRÍTICO** — Este es el diferenciador de producto.

Multi-step wizard que usa la API de Nexus Core para crear un proyecto completo:

```
Step 1: Basics
├── Project name
├── Client name
├── Industry (select)
├── Template (sales, support, operations, custom)
└── [Next →]

Step 2: Agent Identity (conversational)
├── Chat interface with the onboarding agent
├── The agent asks:
│   - ¿Cómo se llama el agente?
│   - ¿Cómo habla? (formal/informal/voseo)
│   - ¿Cuál es su rol principal?
│   - ¿Qué NO debería hacer nunca?
├── Real-time preview of generated prompt layers
└── [Next →]

Step 3: Integrations
├── Credentials (key-value, masked)
├── MCP Servers (add from catalog or custom)
├── Channels (WhatsApp, Telegram, Slack, Email)
└── [Next →]

Step 4: Limits & Costs
├── Daily budget USD
├── Monthly budget USD
├── Max turns per session
├── Max concurrent sessions
└── [Next →]

Step 5: Review & Deploy
├── Summary of all config
├── Generated YAML preview
├── [Create Project] button
└── After creation → redirect to chat test page
```

**API calls:**
- Step 2: `POST /api/v1/sessions` (onboarding agent session) + `POST /sessions/:id/messages/stream` (WebSocket streaming)
- Step 5: `POST /api/v1/projects` + `POST /projects/:id/prompt-layers` (3 calls, one per layer)

---

### 4. Project Overview (`/projects/[projectId]`)

Dashboard específico del proyecto con:
- Status badge (active/paused)
- Agent list (cards)
- Active sessions count
- Cost today / this month
- Quick actions: Pause, Edit Config, Test Chat

---

### 5. Prompt Layers Editor (`/projects/[projectId]/prompts`)

```
┌─────────────────────────────────────────────────────────┐
│ Prompt Layers — Cartones del Sur                         │
│                                                          │
│ [Identity ▼v1] [Instructions ▼v3] [Safety ▼v1]          │
│                                                          │
│ ┌──────────────────────────┬─────────────────────────┐  │
│ │                          │ Version History          │  │
│ │  Monaco Editor           │                          │  │
│ │                          │ v3 (active) — 2/10 14:00│  │
│ │  Sos Sol, la asistente   │   "Added upselling"     │  │
│ │  virtual de ventas de    │                          │  │
│ │  Cartones del Sur...     │ v2 — 2/08 11:30         │  │
│ │                          │   "Fixed tone"           │  │
│ │                          │                          │  │
│ │                          │ v1 — 2/01 09:00          │  │
│ │                          │   "Initial"              │  │
│ │                          │                          │  │
│ │                          │ [Compare v2 ↔ v3]       │  │
│ └──────────────────────────┴─────────────────────────┘  │
│                                                          │
│ Change reason: _______________                           │
│ [Save as New Version]  [Activate v2 (Rollback)]          │
└─────────────────────────────────────────────────────────┘
```

**API calls:**
- `GET /api/v1/projects/:id/prompt-layers` → all versions
- `GET /api/v1/projects/:id/prompt-layers/active` → current active per type
- `POST /api/v1/projects/:id/prompt-layers` → create new version
- `POST /api/v1/prompt-layers/:id/activate` → activate/rollback

---

### 6. Integrations (`/projects/[projectId]/integrations`)

Three tabs: **Credentials**, **MCP Servers**, **Channels**

```
┌─────────────────────────────────────────────────────────┐
│ Integrations — Cartones del Sur                          │
│                                                          │
│ [Credentials] [MCP Servers] [Channels]                   │
│                                                          │
│ Credentials                                              │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Key                    │ Value       │ Actions      │  │
│ │ WHATSAPP_TOKEN         │ ••••••••    │ [Edit] [Del] │  │
│ │ HUBSPOT_API_KEY        │ ••••••••    │ [Edit] [Del] │  │
│ │ CATALOG_API_URL        │ https://..  │ [Edit] [Del] │  │
│ └────────────────────────────────────────────────────┘  │
│ [+ Add Credential]                                       │
│                                                          │
│ MCP Servers                                              │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🟢 google-calendar │ stdio │ npx @anthropic/...   │  │
│ │ 🟢 gmail           │ stdio │ npx @anthropic/...   │  │
│ │ ⚪ custom-crm      │ http  │ http://localhost:8080 │  │
│ └────────────────────────────────────────────────────┘  │
│ [+ Add MCP Server]                                       │
│                                                          │
│ Channels                                                 │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🟢 WhatsApp  │ +54 11 xxxx  │ [Configure] [Test]  │  │
│ │ ⚪ Telegram  │ Not connected │ [Connect]            │  │
│ │ ⚪ Slack     │ Not connected │ [Connect]            │  │
│ │ ⚪ Email     │ Not connected │ [Connect]            │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**API calls:**
- Credentials: `POST/GET/DELETE /api/v1/projects/:id/secrets`
- MCP: `GET/POST/DELETE /api/v1/projects/:id/mcp-servers` + `POST /mcp-servers/:id/restart`
- Channels: Uses the channel config in project settings

**NOTA:** Las APIs de credentials y MCP todavía no existen en Nexus Core. El dashboard las necesita, así que hay que crearlas en el backend. Por ahora, crear los componentes con datos mock y un TODO en el API client.

---

### 7. Chat Test (`/projects/[projectId]/agents/[agentId]/chat`)

Full-screen chat interface conectado via WebSocket.

```
┌─────────────────────────────────────────────────────────┐
│ Chat — Sol (sales-agent)            [Clear] [Export]     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │                                                    │  │
│ │ 👤 Hola, necesito 2000 cajas de corrugado triple   │  │
│ │                                                    │  │
│ │ 🤖 ¡Hola! Busco eso en el catálogo...             │  │
│ │    ┌─────────────────────────────────────┐         │  │
│ │    │ 🔧 search-products                  │         │  │
│ │    │ Input: { query: "corrugado triple" } │         │  │
│ │    │ Duration: 450ms ✅                   │         │  │
│ │    └─────────────────────────────────────┘         │  │
│ │                                                    │  │
│ │ 🤖 Encontré 3 opciones:                           │  │
│ │    1. CT-300 — $245/u                              │  │
│ │    2. CT-300R — $310/u                             │  │
│ │    3. CT-300P — $380/u                             │  │
│ │                                                    │  │
│ │ 👤 Dale, la opción 2. Enviásela a juan@...        │  │
│ │                                                    │  │
│ │ 🤖 Cotización generada. Email pendiente de         │  │
│ │    aprobación.                                     │  │
│ │    ┌─────────────────────────────────────┐         │  │
│ │    │ ⏳ APPROVAL REQUIRED                 │         │  │
│ │    │ send-email → juan@distribuidora.com  │         │  │
│ │    │ [✅ Approve] [❌ Deny]               │         │  │
│ │    └─────────────────────────────────────┘         │  │
│ │                                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────┐ [Send]           │
│ │ Type a message...                  │                   │
│ └────────────────────────────────────┘                   │
│                                                          │
│ Session: sess_abc123 │ Turns: 3 │ Cost: $0.02 │ Trace ↗│
└─────────────────────────────────────────────────────────┘
```

**WebSocket events to handle:**
- `message.content_delta` → streaming text
- `message.tool_start` → show tool call card (loading)
- `message.tool_complete` → update tool call card (result)
- `message.approval_required` → show approval inline card
- `message.complete` → update stats bar
- `session.cost_alert` → show warning toast

---

### 8. Costs (`/projects/[projectId]/costs`)

Charts + table with daily/monthly breakdown per agent.

- Line chart: cost over time (last 30 days)
- Bar chart: cost by agent
- Table: detailed usage (date, agent, tokens in/out, cost, sessions)
- Budget progress bars (daily, monthly) with alert thresholds

---

### 9. Approvals (`/approvals`)

Global view of all pending approvals across all projects.

- Filterable by project, agent, tool, status
- Each card shows: tool, action preview, age, project, agent
- One-click approve/deny with optional note
- Auto-refresh every 10 seconds

---

## API Client (`src/lib/api/client.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_NEXUS_API_URL || 'http://localhost:3000';

interface ApiClientConfig {
  apiKey: string;
}

export function createApiClient(config: ApiClientConfig) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    patch: <T>(path: string, body: unknown) => request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    delete: (path: string) => request(path, { method: 'DELETE' }),
  };
}
```

---

## WebSocket Client (`src/lib/websocket.ts`)

```typescript
export interface WebSocketConfig {
  url: string;
  apiKey: string;
  projectId: string;
  onMessage: (event: NexusEvent) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export type NexusEvent =
  | { type: 'session.created'; sessionId: string }
  | { type: 'message.content_delta'; text: string }
  | { type: 'message.tool_start'; toolCallId: string; tool: string; input: unknown }
  | { type: 'message.tool_complete'; toolCallId: string; success: boolean; output: unknown; durationMs: number }
  | { type: 'message.approval_required'; approvalId: string; tool: string; action: unknown }
  | { type: 'message.complete'; messageId: string; usage: Usage; traceId: string }
  | { type: 'session.cost_alert'; currentSpend: number; budget: number; percent: number }
  | { type: 'error'; code: string; message: string };

export function createWebSocket(config: WebSocketConfig): {
  send: (message: string) => void;
  createSession: (metadata?: Record<string, unknown>) => void;
  close: () => void;
} {
  const ws = new WebSocket(config.url);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'auth',
      apiKey: config.apiKey,
      projectId: config.projectId,
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data as string) as NexusEvent;
    config.onMessage(data);
  };

  ws.onerror = config.onError ?? (() => {});
  ws.onclose = config.onClose ?? (() => {});

  return {
    send(content: string) {
      ws.send(JSON.stringify({ type: 'message.send', content }));
    },
    createSession(metadata?: Record<string, unknown>) {
      ws.send(JSON.stringify({ type: 'session.create', metadata }));
    },
    close() {
      ws.close();
    },
  };
}
```

---

## Environment Variables

```bash
# .env.local.example
NEXT_PUBLIC_NEXUS_API_URL=http://localhost:3000
NEXT_PUBLIC_NEXUS_WS_URL=ws://localhost:3000/ws
```

---

## Setup Commands

```bash
# Initialize project
pnpm create next-app nexus-dashboard --typescript --tailwind --eslint --app --src-dir

cd nexus-dashboard

# Install dependencies
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add react-hook-form @hookform/resolvers zod
pnpm add recharts
pnpm add @monaco-editor/react
pnpm add lucide-react
pnpm add class-variance-authority clsx tailwind-merge
pnpm add date-fns

# shadcn/ui setup
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label select textarea
pnpm dlx shadcn@latest add dialog sheet dropdown-menu
pnpm dlx shadcn@latest add tabs badge separator
pnpm dlx shadcn@latest add toast sonner
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add skeleton

# Dev
pnpm dev
```

---

## Implementation Order

```
Phase 1: Foundation (Day 1-2)
├── Next.js project setup
├── shadcn/ui installation + dark theme
├── Layout (sidebar, header, page-shell)
├── API client + auth (API key login)
├── TanStack Query provider

Phase 2: Core CRUD (Day 3-5)
├── Projects list + create
├── Project overview page
├── Agents list + basic config form
├── Prompt layers editor (Monaco + version list)

Phase 3: Chat & Approvals (Day 6-8)
├── WebSocket client
├── Chat test page (streaming, tool calls, approvals)
├── Global approvals page
├── Approval inline actions

Phase 4: Integrations & Monitoring (Day 9-11)
├── Credentials manager
├── MCP server config
├── Channel config
├── Cost charts + usage table

Phase 5: Onboarding Wizard (Day 12-14)
├── Multi-step wizard UI
├── Onboarding agent chat (Step 2)
├── Auto-generation of prompt layers
├── Review + deploy flow

Phase 6: Polish (Day 15-16)
├── Loading states + skeletons
├── Error handling + toasts
├── Responsive (tablet minimum)
├── Keyboard shortcuts
```

---

## Coding Conventions

1. **Server Components by default** — use `'use client'` only when needed (interactivity, hooks)
2. **Named exports only** — no default exports
3. **Zod schemas** — mirror backend schemas for form validation
4. **TanStack Query** — all API calls go through query hooks, never raw fetch in components
5. **Error boundaries** — wrap each page section
6. **Optimistic updates** — for approvals (approve/deny should feel instant)
7. **TypeScript strict** — no `any`, explicit return types on exported functions
8. **Imports:** `@/components/...`, `@/lib/...`, `@/app/...`

---

## Notes for AI Coder

1. **Start with the layout** — get sidebar + routing + dark theme working first
2. **Mock data first** — create `src/lib/mock-data.ts` with realistic data for all entities. Build all pages against mocks, then swap for real API calls
3. **The onboarding wizard is the hardest part** — save it for Phase 5 when everything else works
4. **Don't overcomplicate auth** — API key stored in localStorage (or cookie), sent as Bearer token. No need for NextAuth or complex flows.
5. **The chat page is the second hardest** — WebSocket + streaming + tool call visualization + inline approvals. Build it incrementally.
6. **shadcn/ui theming** — set up the dark theme in `globals.css` first, then all components inherit it
7. **Monaco Editor** — use `@monaco-editor/react`, not `monaco-editor` directly. It handles lazy loading.

---

## APIs que el dashboard necesita pero aún NO existen en Nexus Core

Estas necesitan ser creadas en el backend (backlog para otro task):

| Endpoint | Descripción | Prioridad |
|---|---|---|
| `GET/POST/DELETE /projects/:id/secrets` | Gestión de credenciales (cifradas) | Alta |
| `GET/POST/DELETE /projects/:id/mcp-servers` | Config MCP servers | Alta |
| `POST /mcp-servers/:id/restart` | Restart MCP server | Media |
| `POST /mcp-servers/:id/health` | Health check MCP server | Media |
| `GET /projects/:id/agents/:id/sessions` | Sesiones de un agente específico | Media |
| `GET /dashboard/overview` | Stats agregadas para home | Baja (se puede calcular client-side) |

Para estas APIs, crear los componentes con datos mock y un `// TODO: connect to real API` en el hook.

---

## Checklist

- [ ] Next.js project con App Router + TypeScript
- [ ] shadcn/ui instalado con dark theme
- [ ] Layout: sidebar + header + page-shell
- [ ] API client con auth
- [ ] TanStack Query provider + devtools
- [ ] Login page (API key)
- [ ] Dashboard home con stats + approvals + activity
- [ ] Projects list + cards
- [ ] Project overview
- [ ] Agents list + config form
- [ ] Prompt layers editor con Monaco + versiones + diff
- [ ] Integrations: credentials + MCP + channels
- [ ] Chat test page con WebSocket streaming
- [ ] Approvals page (global)
- [ ] Costs page con charts
- [ ] Scheduled tasks page
- [ ] Onboarding wizard (5 steps)
- [ ] Loading states + error handling
- [ ] Responsive layout