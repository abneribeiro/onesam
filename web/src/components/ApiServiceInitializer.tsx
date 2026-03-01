'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component to initialize API service with authentication callbacks
 * This must be placed inside AuthProvider to access auth context
 */
export function ApiServiceInitializer() {
  const { logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth-aware callbacks for the API service
    const showErrorNotification = (message: string) => {
      toast.error(message);
    };

    const handleAuthLogout = async () => {
      try {
        // Clear all queries when logging out due to auth failure
        queryClient.clear();
        await logout();
      } catch (error) {
        console.error('Error during automatic logout:', error);
      }
    };

    apiService.setAuthCallbacks(handleAuthLogout, showErrorNotification);
  }, [logout, queryClient]);

  // Effect to handle cache invalidation on auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all cached data when user becomes unauthenticated
      queryClient.clear();
    } else {
      // Optionally refetch some critical data when user becomes authenticated
      // This ensures fresh data after login
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          // Refetch user profile and notifications on login
          return queryKey === 'user-profile' || queryKey === 'notifications';
        }
      });
    }
  }, [isAuthenticated, queryClient]);

  // This component renders nothing, it just sets up the callbacks
  return null;
}

export default ApiServiceInitializer;