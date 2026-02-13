/**
 * WebSocket Client for FOMO Core
 *
 * Handles real-time communication with agents including:
 * - Message streaming
 * - Tool call events
 * - Approval requests
 * - Session lifecycle events
 */

const WS_BASE = process.env.NEXT_PUBLIC_FOMO_WS_URL || 'ws://localhost:3002/api/v1/ws';

// =============================================================================
// Event Types
// =============================================================================

export interface SessionCreatedEvent {
  type: 'session.created';
  sessionId: string;
}

export interface ContentDeltaEvent {
  type: 'message.content_delta';
  text: string;
}

export interface ToolStartEvent {
  type: 'message.tool_start';
  toolCallId: string;
  tool: string;
  input: unknown;
}

export interface ToolCompleteEvent {
  type: 'message.tool_complete';
  toolCallId: string;
  success: boolean;
  output: unknown;
  durationMs: number;
}

export interface ApprovalRequiredEvent {
  type: 'message.approval_required';
  approvalId: string;
  tool: string;
  action: unknown;
}

export interface MessageCompleteEvent {
  type: 'message.complete';
  messageId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  traceId: string;
}

export interface CostAlertEvent {
  type: 'session.cost_alert';
  currentSpend: number;
  budget: number;
  percent: number;
}

export interface ErrorEvent {
  type: 'error';
  code: string;
  message: string;
}

export interface AuthSuccessEvent {
  type: 'auth.success';
}

export interface SessionEndedEvent {
  type: 'session.ended';
  sessionId: string;
  reason: 'completed' | 'error' | 'timeout' | 'terminated';
}

export type FomoEvent =
  | SessionCreatedEvent
  | ContentDeltaEvent
  | ToolStartEvent
  | ToolCompleteEvent
  | ApprovalRequiredEvent
  | MessageCompleteEvent
  | CostAlertEvent
  | ErrorEvent
  | AuthSuccessEvent
  | SessionEndedEvent;

// =============================================================================
// WebSocket Client
// =============================================================================

export interface WebSocketConfig {
  apiKey: string;
  projectId: string;
  onEvent: (event: FomoEvent) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

export interface FomoWebSocket {
  send: (content: string) => void;
  createSession: (agentId?: string, metadata?: Record<string, unknown>) => void;
  approve: (approvalId: string, note?: string) => void;
  deny: (approvalId: string, note?: string) => void;
  close: () => void;
  getState: () => 'connecting' | 'open' | 'closing' | 'closed';
}

export function createWebSocket(config: WebSocketConfig): FomoWebSocket {
  const url = `${WS_BASE}?projectId=${config.projectId}`;
  const ws = new WebSocket(url);

  ws.onopen = () => {
    // Send authentication
    ws.send(JSON.stringify({
      type: 'auth',
      apiKey: config.apiKey,
    }));
    config.onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as FomoEvent;
      config.onEvent(data);
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    config.onError?.(error);
  };

  ws.onclose = (event) => {
    config.onClose?.(event);
  };

  function send(type: string, payload: Record<string, unknown>): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...payload }));
    } else {
      console.warn('WebSocket not open, cannot send message');
    }
  }

  return {
    send(content: string) {
      send('message.send', { content });
    },

    createSession(agentId?: string, metadata?: Record<string, unknown>) {
      send('session.create', { agentId, metadata });
    },

    approve(approvalId: string, note?: string) {
      send('approval.decide', { approvalId, approved: true, note });
    },

    deny(approvalId: string, note?: string) {
      send('approval.decide', { approvalId, approved: false, note });
    },

    close() {
      ws.close();
    },

    getState() {
      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          return 'connecting';
        case WebSocket.OPEN:
          return 'open';
        case WebSocket.CLOSING:
          return 'closing';
        case WebSocket.CLOSED:
        default:
          return 'closed';
      }
    },
  };
}

// =============================================================================
// Reconnecting WebSocket
// =============================================================================

export interface ReconnectingWebSocketConfig extends WebSocketConfig {
  reconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  onReconnecting?: (attempt: number) => void;
  onReconnected?: () => void;
}

export interface ReconnectingFomoWebSocket extends FomoWebSocket {
  reconnect: () => void;
}

export function createReconnectingWebSocket(
  config: ReconnectingWebSocketConfig
): ReconnectingFomoWebSocket {
  const reconnectDelay = config.reconnectDelayMs ?? 3000;
  const maxAttempts = config.maxReconnectAttempts ?? 5;
  
  let ws: FomoWebSocket | null = null;
  let reconnectAttempts = 0;
  let shouldReconnect = true;

  function connect(): void {
    ws = createWebSocket({
      ...config,
      onOpen: () => {
        reconnectAttempts = 0;
        if (reconnectAttempts > 0) {
          config.onReconnected?.();
        }
        config.onOpen?.();
      },
      onClose: (event) => {
        config.onClose?.(event);
        
        if (shouldReconnect && !event.wasClean && reconnectAttempts < maxAttempts) {
          reconnectAttempts++;
          config.onReconnecting?.(reconnectAttempts);
          setTimeout(connect, reconnectDelay);
        }
      },
    });
  }

  connect();

  return {
    send(content: string) {
      ws?.send(content);
    },
    createSession(agentId?: string, metadata?: Record<string, unknown>) {
      ws?.createSession(agentId, metadata);
    },
    approve(approvalId: string, note?: string) {
      ws?.approve(approvalId, note);
    },
    deny(approvalId: string, note?: string) {
      ws?.deny(approvalId, note);
    },
    close() {
      shouldReconnect = false;
      ws?.close();
    },
    getState() {
      return ws?.getState() ?? 'closed';
    },
    reconnect() {
      shouldReconnect = true;
      reconnectAttempts = 0;
      ws?.close();
      connect();
    },
  };
}
