'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setApiKey, clearApiKey, isAuthenticated } from '@/lib/api/client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check auth status on mount
    setState({
      isAuthenticated: isAuthenticated(),
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (apiKey: string): Promise<boolean> => {
    try {
      // Store the API key temporarily
      setApiKey(apiKey);

      // Try to fetch projects with this "key" to validate access
      const client = (await import('@/lib/api/client')).getApiClient();
      const response = await client.get<{ items: Array<{ id: string; name: string }> }>('/projects');

      // If we can fetch projects, consider authentication successful
      if (response.items && response.items.length > 0) {
        // Store first project as default for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('fomo_default_project', response.items[0].id);
        }
        setState({ isAuthenticated: true, isLoading: false });
        return true;
      }

      // No projects found - invalid key
      throw new Error('No projects found with this API key');
    } catch (error) {
      console.error('Login failed:', error);
      clearApiKey();
      setState({ isAuthenticated: false, isLoading: false });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearApiKey();
    setState({ isAuthenticated: false, isLoading: false });
    router.push('/login');
  }, [router]);

  return {
    ...state,
    login,
    logout,
  };
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated: authenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, isLoading, router]);

  return { isAuthenticated: authenticated, isLoading };
}
