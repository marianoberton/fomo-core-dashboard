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
      // Store the API key
      setApiKey(apiKey);
      
      // In demo mode, accept any non-empty API key
      if (apiKey.trim().length > 0) {
        setState({ isAuthenticated: true, isLoading: false });
        return true;
      }

      clearApiKey();
      setState({ isAuthenticated: false, isLoading: false });
      return false;
    } catch {
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
