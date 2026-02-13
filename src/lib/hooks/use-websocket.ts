'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createReconnectingWebSocket, 
  type NexusEvent, 
  type ReconnectingNexusWebSocket 
} from '@/lib/websocket';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketOptions {
  projectId: string;
  apiKey: string;
  onEvent?: (event: NexusEvent) => void;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  state: ConnectionState;
  events: NexusEvent[];
  send: (content: string) => void;
  createSession: (agentId?: string, metadata?: Record<string, unknown>) => void;
  approve: (approvalId: string, note?: string) => void;
  deny: (approvalId: string, note?: string) => void;
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { projectId, apiKey, onEvent, autoConnect = true } = options;
  
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [events, setEvents] = useState<NexusEvent[]>([]);
  const wsRef = useRef<ReconnectingNexusWebSocket | null>(null);

  const handleEvent = useCallback((event: NexusEvent) => {
    setEvents(prev => [...prev, event]);
    
    // Update connection state based on events
    if (event.type === 'auth.success') {
      setState('connected');
    } else if (event.type === 'error') {
      setState('error');
    }
    
    onEvent?.(event);
  }, [onEvent]);

  const connect = useCallback(() => {
    // If using mocks, simulate connection
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      setState('connected');
      // Create a mock WS object to handle sends without errors
      wsRef.current = {
        send: (content: string) => {
          console.log('[MOCK WS] Sending:', content);
          // Echo back after a delay
          setTimeout(() => {
            handleEvent({
              type: 'message.content_delta',
              text: `[Mock Response] You said: ${content}`
            });
            handleEvent({
              type: 'message.complete',
              messageId: 'mock-msg-' + Date.now(),
              usage: { inputTokens: 10, outputTokens: 10, costUsd: 0.001 },
              traceId: 'mock-trace-' + Date.now()
            });
          }, 1000);
        },
        createSession: () => console.log('[MOCK WS] createSession'),
        approve: () => console.log('[MOCK WS] approve'),
        deny: () => console.log('[MOCK WS] deny'),
        close: () => setState('disconnected'),
        getState: () => 'open',
        reconnect: () => {},
      } as unknown as ReconnectingNexusWebSocket;
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setState('connecting');
    
    wsRef.current = createReconnectingWebSocket({
      projectId,
      apiKey,
      onEvent: handleEvent,
      onOpen: () => {
        // Auth will be sent automatically, wait for auth.success
      },
      onClose: () => {
        setState('disconnected');
      },
      onError: () => {
        setState('error');
      },
      onReconnecting: (attempt) => {
        console.log(`Reconnecting... attempt ${attempt}`);
        setState('connecting');
      },
      onReconnected: () => {
        setState('connected');
      },
    });
  }, [projectId, apiKey, handleEvent]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setState('disconnected');
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && apiKey && projectId) {
      connect();
    }
    
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [autoConnect, apiKey, projectId, connect]);

  const send = useCallback((content: string) => {
    wsRef.current?.send(content);
  }, []);

  const createSession = useCallback((agentId?: string, metadata?: Record<string, unknown>) => {
    wsRef.current?.createSession(agentId, metadata);
  }, []);

  const approve = useCallback((approvalId: string, note?: string) => {
    wsRef.current?.approve(approvalId, note);
  }, []);

  const deny = useCallback((approvalId: string, note?: string) => {
    wsRef.current?.deny(approvalId, note);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    state,
    events,
    send,
    createSession,
    approve,
    deny,
    connect,
    disconnect,
    clearEvents,
  };
}

// =============================================================================
// Chat-specific hook
// =============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  approval?: ApprovalRequest;
  timestamp: Date;
}

export interface ToolCall {
  id: string;
  tool: string;
  input: unknown;
  output?: unknown;
  status: 'pending' | 'success' | 'error';
  durationMs?: number;
}

export interface ApprovalRequest {
  id: string;
  tool: string;
  action: unknown;
  status: 'pending' | 'approved' | 'denied';
}

export interface UseChatReturn extends Omit<UseWebSocketReturn, 'events'> {
  messages: ChatMessage[];
  currentMessage: string;
  isStreaming: boolean;
  sessionId: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  clearChat: () => void;
}

export function useChat(options: UseWebSocketOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [usage, setUsage] = useState({ inputTokens: 0, outputTokens: 0, costUsd: 0 });
  
  const currentMessageRef = useRef('');
  const currentToolCallsRef = useRef<Map<string, ToolCall>>(new Map());
  const currentApprovalRef = useRef<ApprovalRequest | null>(null);

  const handleEvent = useCallback((event: NexusEvent) => {
    switch (event.type) {
      case 'session.created':
        setSessionId(event.sessionId);
        break;
        
      case 'message.content_delta':
        currentMessageRef.current += event.text;
        setCurrentMessage(currentMessageRef.current);
        setIsStreaming(true);
        break;
        
      case 'message.tool_start':
        currentToolCallsRef.current.set(event.toolCallId, {
          id: event.toolCallId,
          tool: event.tool,
          input: event.input,
          status: 'pending',
        });
        break;
        
      case 'message.tool_complete':
        const toolCall = currentToolCallsRef.current.get(event.toolCallId);
        if (toolCall) {
          toolCall.output = event.output;
          toolCall.status = event.success ? 'success' : 'error';
          toolCall.durationMs = event.durationMs;
        }
        break;
        
      case 'message.approval_required':
        currentApprovalRef.current = {
          id: event.approvalId,
          tool: event.tool,
          action: event.action,
          status: 'pending',
        };
        break;
        
      case 'message.complete':
        // Finalize the message
        const newMessage: ChatMessage = {
          id: event.messageId,
          role: 'assistant',
          content: currentMessageRef.current,
          toolCalls: Array.from(currentToolCallsRef.current.values()),
          approval: currentApprovalRef.current || undefined,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        setCurrentMessage('');
        setIsStreaming(false);
        
        // Update usage
        setUsage(prev => ({
          inputTokens: prev.inputTokens + event.usage.inputTokens,
          outputTokens: prev.outputTokens + event.usage.outputTokens,
          costUsd: prev.costUsd + event.usage.costUsd,
        }));
        
        // Reset refs
        currentMessageRef.current = '';
        currentToolCallsRef.current.clear();
        currentApprovalRef.current = null;
        break;
    }
  }, []);

  const ws = useWebSocket({
    ...options,
    onEvent: handleEvent,
  });

  const sendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to server
    ws.send(content);
  }, [ws]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setUsage({ inputTokens: 0, outputTokens: 0, costUsd: 0 });
    setSessionId(null);
  }, []);

  return {
    ...ws,
    send: sendMessage,
    messages,
    currentMessage,
    isStreaming,
    sessionId,
    usage,
    clearChat,
  };
}
