# FOMO Core Dashboard

Web interface for FOMO Core - the FOMO AI Agent Management Platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_FOMO_API_URL` - FOMO Core API URL (default: http://localhost:3002)
- `NEXT_PUBLIC_FOMO_WS_URL` - WebSocket URL for real-time events

## Stack

- **Next.js 16** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **shadcn/ui** components
- **TanStack Query v5** for data fetching
- **React Hook Form + Zod** for forms
- **Monaco Editor** for prompt editing
- **Recharts** for cost visualization

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard overview with stats and pending approvals |
| `/login` | API key authentication |
| `/projects` | Project list and management |
| `/projects/new` | 5-step onboarding wizard |
| `/projects/[id]` | Project detail with agents |
| `/projects/[id]/prompts` | Prompt layer editor (identity, instructions, safety) |
| `/projects/[id]/agents/[id]` | Agent configuration |
| `/projects/[id]/agents/[id]/chat` | WebSocket chat for testing |
| `/approvals` | Global pending approvals |
| `/projects/[id]/integrations` | Credentials, MCP servers, channels |
| `/projects/[id]/costs` | Usage charts and budget tracking |
| `/projects/[id]/tasks` | Scheduled task management |
| `/projects/[id]/agents/new` | Create new agent |
| `/projects/[id]/agents/[id]/logs` | Agent traces and history |

## Features

### Implemented ✅
- Dark theme by default
- Collapsible sidebar navigation
- Project CRUD operations
- Agent management
- Prompt layers editor with version history
- Real-time chat with WebSocket streaming
- Tool call visualization
- Inline approval handling
- Onboarding wizard (5 steps)
- TanStack Query caching & optimistic updates

### Pending APIs (use mock data)
- `GET/POST/DELETE /projects/:id/secrets` - Credentials management
- `GET/POST/DELETE /projects/:id/mcp-servers` - MCP server config
- Cost charts and usage data

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components (sidebar, header)
├── lib/
│   ├── api/                # API client modules
│   ├── hooks/              # React Query hooks
│   ├── schemas.ts          # Zod schemas
│   ├── websocket.ts        # WebSocket client
│   └── utils.ts            # Utility functions
└── styles/
    └── globals.css         # Tailwind config
```

## Design System

- **Background**: zinc-950 (#09090b)
- **Cards**: zinc-900 (#18181b)
- **Borders**: zinc-800 (#27272a)
- **Primary accent**: violet-600 (#7c3aed)
- **Typography**: Geist Sans + Geist Mono

---

Built by FOMO for FOMO Core.
