'use client';

import { use, useState } from 'react';
import { 
  Activity, 
  MessageSquare, 
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatRelativeTime, formatDuration, formatCurrency } from '@/lib/utils';

interface Props {
  params: Promise<{ projectId: string; agentId: string }>;
}

// Mock data
const mockTraces = [
  {
    id: 'trace-1',
    sessionId: 'sess-abc123',
    type: 'session_end',
    timestamp: '2026-02-10T16:45:00Z',
    data: { status: 'completed', turns: 5, costUsd: 0.024 },
  },
  {
    id: 'trace-2',
    sessionId: 'sess-abc123',
    type: 'tool_call_end',
    timestamp: '2026-02-10T16:44:55Z',
    data: { tool: 'search-products', success: true, durationMs: 450 },
  },
  {
    id: 'trace-3',
    sessionId: 'sess-abc123',
    type: 'tool_call_start',
    timestamp: '2026-02-10T16:44:54Z',
    data: { tool: 'search-products', input: { query: 'corrugado triple' } },
  },
  {
    id: 'trace-4',
    sessionId: 'sess-abc123',
    type: 'message_sent',
    timestamp: '2026-02-10T16:44:50Z',
    data: { preview: 'Encontré 3 opciones de corrugado triple...' },
  },
  {
    id: 'trace-5',
    sessionId: 'sess-abc123',
    type: 'message_received',
    timestamp: '2026-02-10T16:44:45Z',
    data: { preview: 'Necesito 2000 cajas de corrugado triple' },
  },
  {
    id: 'trace-6',
    sessionId: 'sess-abc123',
    type: 'session_start',
    timestamp: '2026-02-10T16:44:40Z',
    data: { channel: 'whatsapp', metadata: { phone: '+54 11 xxxx' } },
  },
  {
    id: 'trace-7',
    sessionId: 'sess-def456',
    type: 'error',
    timestamp: '2026-02-10T15:30:00Z',
    data: { code: 'TOOL_TIMEOUT', message: 'CRM query timed out after 30s' },
  },
  {
    id: 'trace-8',
    sessionId: 'sess-def456',
    type: 'session_end',
    timestamp: '2026-02-10T15:30:00Z',
    data: { status: 'error', turns: 3, costUsd: 0.012 },
  },
];

const traceIcons: Record<string, React.ElementType> = {
  session_start: Activity,
  session_end: Activity,
  message_received: MessageSquare,
  message_sent: MessageSquare,
  tool_call_start: Wrench,
  tool_call_end: Wrench,
  approval_requested: Clock,
  approval_decided: CheckCircle2,
  error: XCircle,
};

function TraceRow({ trace }: { trace: typeof mockTraces[0] }) {
  const Icon = traceIcons[trace.type] || Activity;
  const isError = trace.type === 'error' || (trace.type === 'session_end' && trace.data.status === 'error');
  const isSuccess = trace.type === 'tool_call_end' && trace.data.success;

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
      <div className={cn(
        'p-2 rounded-lg mt-0.5',
        isError && 'bg-red-500/10',
        isSuccess && 'bg-emerald-500/10',
        !isError && !isSuccess && 'bg-zinc-800'
      )}>
        <Icon className={cn(
          'w-4 h-4',
          isError && 'text-red-400',
          isSuccess && 'text-emerald-400',
          !isError && !isSuccess && 'text-zinc-400'
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white capitalize">
            {trace.type.replace(/_/g, ' ')}
          </span>
          <Badge variant="secondary" className="text-xs font-mono">
            {trace.sessionId.slice(0, 12)}
          </Badge>
        </div>
        
        <div className="text-sm text-zinc-400">
          {trace.type === 'session_start' && (
            <span>Started via {trace.data.channel}</span>
          )}
          {trace.type === 'session_end' && (
            <span>
              {trace.data.status === 'completed' ? 'Completed' : 'Failed'} • 
              {trace.data.turns} turns • {formatCurrency(trace.data.costUsd ?? 0)}
            </span>
          )}
          {trace.type === 'message_received' && (
            <span className="truncate block">{trace.data.preview}</span>
          )}
          {trace.type === 'message_sent' && (
            <span className="truncate block">{trace.data.preview}</span>
          )}
          {trace.type === 'tool_call_start' && (
            <span className="font-mono">{trace.data.tool}</span>
          )}
          {trace.type === 'tool_call_end' && (
            <span>
              <span className="font-mono">{trace.data.tool}</span> • 
              {formatDuration(trace.data.durationMs ?? 0)}
            </span>
          )}
          {trace.type === 'error' && (
            <span className="text-red-400">{trace.data.message}</span>
          )}
        </div>
      </div>
      
      <div className="text-xs text-zinc-500 whitespace-nowrap">
        {formatRelativeTime(trace.timestamp)}
      </div>
    </div>
  );
}

export default function AgentLogsPage({ params }: Props) {
  const { projectId, agentId } = use(params);
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTraces = filter === 'all' 
    ? mockTraces 
    : mockTraces.filter(t => {
        if (filter === 'errors') return t.type === 'error' || (t.type === 'session_end' && t.data.status === 'error');
        if (filter === 'sessions') return t.type.startsWith('session_');
        if (filter === 'tools') return t.type.startsWith('tool_');
        if (filter === 'messages') return t.type.startsWith('message_');
        return true;
      });

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  return (
    <DashboardLayout>
      <PageShell
        title="Agent Logs"
        description="Traces and execution history"
        actions={
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="sessions">Sessions</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
                <SelectItem value="tools">Tool Calls</SelectItem>
                <SelectItem value="errors">Errors</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-zinc-700"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            
            <Link href={`/projects/${projectId}/agents/${agentId}/chat`}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Chat
              </Button>
            </Link>
          </div>
        }
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0 divide-y divide-zinc-800">
            {filteredTraces.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400">No traces found</p>
              </div>
            ) : (
              filteredTraces.map((trace) => (
                <TraceRow key={trace.id} trace={trace} />
              ))
            )}
          </CardContent>
        </Card>

        {filteredTraces.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" className="border-zinc-700">
              Load More
            </Button>
          </div>
        )}
      </PageShell>
    </DashboardLayout>
  );
}
