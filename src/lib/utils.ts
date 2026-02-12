import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

/**
 * Format a number with compact notation (1K, 1M, etc.)
 */
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format a number as tokens (with 'k' suffix for thousands)
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

/**
 * Format a timestamp as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Format a timestamp as a readable date
 */
export function formatDate(timestamp: string | Date, formatStr = 'MMM d, yyyy'): string {
  return format(new Date(timestamp), formatStr);
}

/**
 * Format a timestamp as date and time
 */
export function formatDateTime(timestamp: string | Date): string {
  return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
}

/**
 * Format a duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

// =============================================================================
// Status Utilities
// =============================================================================

export type StatusColor = 'green' | 'yellow' | 'red' | 'gray';

/**
 * Get status color for different entity statuses
 */
export function getStatusColor(status: string): StatusColor {
  switch (status.toLowerCase()) {
    case 'active':
    case 'connected':
    case 'success':
    case 'approved':
    case 'completed':
      return 'green';
    case 'pending':
    case 'paused':
    case 'warning':
      return 'yellow';
    case 'error':
    case 'denied':
    case 'failed':
    case 'expired':
    case 'timeout':
      return 'red';
    case 'archived':
    case 'disconnected':
    default:
      return 'gray';
  }
}

/**
 * Get status badge variant for shadcn Badge component
 */
export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const color = getStatusColor(status);
  switch (color) {
    case 'green':
      return 'default';
    case 'yellow':
      return 'secondary';
    case 'red':
      return 'destructive';
    default:
      return 'outline';
  }
}

// =============================================================================
// Data Utilities
// =============================================================================

/**
 * Mask a secret value (show first 4 and last 4 chars)
 */
export function maskSecret(value: string): string {
  if (value.length <= 8) {
    return '••••••••';
  }
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generate a random ID (for optimistic updates)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// Error Utilities
// =============================================================================

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

// =============================================================================
// URL Utilities
// =============================================================================

/**
 * Build URL with query parameters
 */
export function buildUrl(
  base: string, 
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}
