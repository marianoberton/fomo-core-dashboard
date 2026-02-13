/**
 * FOMO Core API Client
 *
 * Provides typed API calls to the FOMO Core backend.
 * Uses Bearer token authentication with API key.
 */

const API_BASE = process.env.NEXT_PUBLIC_FOMO_API_URL || 'http://localhost:3002';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientConfig {
  apiKey: string;
}

export interface ApiClient {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body: unknown) => Promise<T>;
  put: <T>(path: string, body: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}/api/v1${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      let errorCode: string | undefined;

      try {
        const errorBody = await response.json();
        // Backend wraps errors in { success: false, error: { code, message } }
        if (errorBody.error && typeof errorBody.error === 'object') {
          errorMessage = errorBody.error.message || errorMessage;
          errorCode = errorBody.error.code;
        } else {
          errorMessage = errorBody.message || errorBody.error || errorMessage;
          errorCode = errorBody.code;
        }
      } catch {
        // Ignore JSON parse errors
      }

      throw new ApiError(response.status, errorMessage, errorCode);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const json = await response.json();

    // Unwrap FOMO Core envelope: { success: true, data: T } → T
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data as T;
    }

    return json as T;
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) => 
      request<T>(path, { 
        method: 'POST', 
        body: body ? JSON.stringify(body) : undefined,
      }),
    patch: <T>(path: string, body: unknown) => 
      request<T>(path, { 
        method: 'PATCH', 
        body: JSON.stringify(body),
      }),
    put: <T>(path: string, body: unknown) => 
      request<T>(path, { 
        method: 'PUT', 
        body: JSON.stringify(body),
      }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}

// Singleton client instance - initialized after login
let clientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    // Try to get API key from localStorage
    const apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('fomo_api_key')
      : null;
    
    if (!apiKey) {
      throw new Error('Not authenticated. Please login with your API key.');
    }
    
    clientInstance = createApiClient({ apiKey });
  }
  return clientInstance;
}

export function setApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fomo_api_key', apiKey);
  }
  clientInstance = createApiClient({ apiKey });
}

export function clearApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fomo_api_key');
  }
  clientInstance = null;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('fomo_api_key');
}
