/**
 * Auth Hook
 * Manages authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { UserProfile, AuthCredentials, ServiceStatus } from '@/types';

interface UseAuthReturn {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: ServiceStatus;
  
  // Actions
  login: (credentials: AuthCredentials) => Promise<boolean>;
  signup: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ServiceStatus>({
    isLoading: false,
    error: null,
  });

  // Load user on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    setStatus({ isLoading: true, error: null });
    
    const response = await authService.login(credentials);
    
    if (response.error) {
      setStatus({ isLoading: false, error: response.error });
      return false;
    }
    
    setUser(response.user);
    setStatus({ isLoading: false, error: null });
    return true;
  }, []);

  const signup = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    setStatus({ isLoading: true, error: null });
    
    const response = await authService.signup(credentials);
    
    if (response.error) {
      setStatus({ isLoading: false, error: response.error });
      return false;
    }
    
    setUser(response.user);
    setStatus({ isLoading: false, error: null });
    return true;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    setStatus({ isLoading: true, error: null });
    
    const response = await authService.updateProfile(updates);
    
    if (response.error) {
      setStatus({ isLoading: false, error: response.error });
      return false;
    }
    
    setUser(response.user);
    setStatus({ isLoading: false, error: null });
    return true;
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    setStatus({ isLoading: true, error: null });
    
    const response = await authService.requestPasswordReset(email);
    
    setStatus({ isLoading: false, error: response.error });
    return response.success;
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    status,
    login,
    signup,
    logout,
    updateProfile,
    requestPasswordReset,
  };
}

export default useAuth;
