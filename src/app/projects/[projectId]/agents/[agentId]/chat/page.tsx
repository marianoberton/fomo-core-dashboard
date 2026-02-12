'use client';

import { use, useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Bot,
  User,
  Wrench,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout, PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgent } from '@/lib/hooks/use-agents';
import { useChat, type ChatMessage, type ToolCall, type ApprovalRequest } from '@/lib/hooks/use-websocket';
import { formatCurrency, formatDuration, cn } from '@/lib/utils';

interface Props {
  params: Promise<{ projectId: string; agentId: string }>;
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={cn(
        'border rounded-lg p-3 my-2 text-sm font-mono',
        toolCall.status === 'pending' && 'border-amber-500/30 bg-amber-500/5',
        toolCall.status === 'success' && 'border-emerald-500/30 bg-emerald-500/5',
        toolCall.status === 'error' && 'border-red-500/30 bg-red-500/5'
      )}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Wrench className={cn(
            'w-4 h-4',
            toolCall.status === 'pending' && 'text-amber-400 animate-pulse',
            toolCall.status === 'success' && 'text-emerald-400',
            toolCall.status === 'error' && 'text-red-400'
          )} />
          <span className="text-zinc-300">{toolCall.tool}</span>
        </div>
        <div className="flex items-center gap-2">
          {toolCall.durationMs && (
            <span className="text-xs text-zinc-500">
              {formatDuration(toolCall.durationMs)}
            </span>
          )}
          {toolCall.status === 'pending' && (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          )}
          {toolCall.status === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          {toolCall.status === 'error' && (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
          <div>
            <span className="text-xs text-zinc-500">Input:</span>
            <pre className="text-xs text-zinc-400 mt-1 overflow-x-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          {toolCall.output !== undefined && (
            <div>
              <span className="text-xs text-zinc-500">Output:</span>
              <pre className="text-xs text-zinc-400 mt-1 overflow-x-auto">
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ 
  approval,
  onApprove,
  onDeny,
}: { 
  approval: ApprovalRequest;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" />
        <span className="font-medium text-amber-400">Approval Required</span>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-zinc-300">
          <span className="font-mono bg-zinc-800 px-1 rounded">{approval.tool}</span>
          {' '}wants to perform an action
        </p>
        <pre className="text-xs text-zinc-400 mt-2 p-2 bg-zinc-800/50 rounded overflow-x-auto">
          {JSON.stringify(approval.action, null, 2)}
        </pre>
      </div>
      
      {approval.status === 'pending' && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onApprove}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeny}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Deny
          </Button>
        </div>
      )}
      
      {approval.status !== 'pending' && (
        <Badge variant={approval.status === 'approved' ? 'default' : 'destructive'}>
          {approval.status}
        </Badge>
      )}
    </div>
  );
}

function MessageBubble({ 
  message,
  onApprove,
  onDeny,
}: { 
  message: ChatMessage;
  onApprove?: (approvalId: string) => void;
  onDeny?: (approvalId: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-violet-600' : 'bg-zinc-700'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={cn('flex-1 max-w-[80%]', isUser && 'text-right')}>
        <div className={cn(
          'inline-block rounded-2xl px-4 py-2',
          isUser 
            ? 'bg-violet-600 text-white rounded-br-sm' 
            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2">
            {message.toolCalls.map((toolCall) => (
              <ToolCallCard key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}
        
        {/* Approval Request */}
        {message.approval && onApprove && onDeny && (
          <ApprovalCard 
            approval={message.approval}
            onApprove={() => onApprove(message.approval!.id)}
            onDeny={() => onDeny(message.approval!.id)}
          />
        )}
        
        <p className={cn(
          'text-xs text-zinc-500 mt-1',
          isUser && 'text-right'
        )}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function StreamingIndicator({ content }: { content: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 max-w-[80%]">
        <div className="inline-block bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2">
          {content ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: Props) {
  const { projectId, agentId } = use(params);
  const { data: agent, isLoading: agentLoading } = useAgent(projectId, agentId);
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get API key from localStorage
  const apiKey = typeof window !== 'undefined' 
    ? localStorage.getItem('nexus_api_key') || '' 
    : '';

  const chat = useChat({
    projectId,
    apiKey,
    autoConnect: !!apiKey,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.currentMessage]);

  // Create session when connected
  useEffect(() => {
    if (chat.state === 'connected' && !chat.sessionId) {
      chat.createSession(agentId);
    }
  }, [chat.state, chat.sessionId, agentId, chat]);

  function handleSend() {
    if (!input.trim() || chat.isStreaming) return;
    chat.send(input.trim());
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (agentLoading) {
    return (
      <DashboardLayout>
        <PageShell>
          <Skeleton className="h-[600px]" />
        </PageShell>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell
        title={`Chat — ${agent?.name || 'Agent'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => chat.clearChat()}
              className="border-zinc-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <Card className="bg-zinc-900 border-zinc-800 h-[calc(100vh-220px)] flex flex-col">
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {chat.messages.length === 0 && !chat.isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Test your agent
                </h3>
                <p className="text-zinc-400 max-w-md">
                  Start a conversation to test how your agent responds.
                  Tool calls and approvals will appear inline.
                </p>
              </div>
            )}
            
            {chat.messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                onApprove={chat.approve}
                onDeny={chat.deny}
              />
            ))}
            
            {chat.isStreaming && (
              <StreamingIndicator content={chat.currentMessage} />
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Stats Bar */}
          <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span>Session: {chat.sessionId?.slice(0, 8) || '—'}</span>
              <span>Turns: {chat.messages.filter(m => m.role === 'user').length}</span>
              <span>Cost: {formatCurrency(chat.usage.costUsd)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                chat.state === 'connected' && 'bg-emerald-400',
                chat.state === 'connecting' && 'bg-amber-400 animate-pulse',
                chat.state === 'disconnected' && 'bg-zinc-400',
                chat.state === 'error' && 'bg-red-400'
              )} />
              <span className="capitalize">{chat.state}</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chat.state !== 'connected' || chat.isStreaming}
                className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chat.state !== 'connected' || chat.isStreaming}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </PageShell>
    </DashboardLayout>
  );
}
