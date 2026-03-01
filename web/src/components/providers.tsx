'use client';

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster, toast } from 'sonner';
import { useState, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ApiServiceInitializer } from './ApiServiceInitializer';
import { isAuthenticationError, isPermissionError, getErrorTypeMessage } from '@/lib/errorHandler';

interface ProvidersProps {
  children: ReactNode;
}

function NotificationProviderWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      {children}
    </NotificationProvider>
  );
}

function createAuthAwareQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Handle authentication errors at global level
        if (isAuthenticationError(error)) {
          // Let API service handle the logout, just invalidate queries
          console.log('Authentication error in query, invalidating cache');
          return;
        }

        // Handle permission errors
        if (isPermissionError(error)) {
          console.log('Permission error in query:', query.queryKey);
          // Don't show toast here as API service already handles it
          return;
        }

        // Handle other errors that should be shown to user
        if (error instanceof Error) {
          console.error('Query error:', error.message, 'Query:', query.queryKey);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // Handle authentication errors
        if (isAuthenticationError(error)) {
          console.log('Authentication error in mutation, letting API service handle logout');
          return;
        }

        // Handle permission errors
        if (isPermissionError(error)) {
          console.log('Permission error in mutation');
          // Don't show toast here as API service already handles it
          return;
        }

        // For other mutation errors, let the component handle them
        // unless they're unexpected server errors
        if (error instanceof Error && !mutation.options.onError) {
          const errorMessage = getErrorTypeMessage(error);
          if (errorMessage !== error.message) {
            toast.error(errorMessage);
          }
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry authentication or permission errors
          if (isAuthenticationError(error) || isPermissionError(error)) {
            return false;
          }

          // Don't retry client errors (400-499)
          if (error instanceof Error && 'response' in error) {
            const status = (error as any).response?.status;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }

          // Retry server errors up to 2 times
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: (failureCount, error) => {
          // Never retry mutations on authentication/permission errors
          if (isAuthenticationError(error) || isPermissionError(error)) {
            return false;
          }

          // Don't retry client errors
          if (error instanceof Error && 'response' in error) {
            const status = (error as any).response?.status;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }

          // Retry server errors only once for mutations
          return failureCount < 1;
        },
      },
    },
  });
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createAuthAwareQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        forcedTheme="light"
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <ApiServiceInitializer />
          <NotificationProviderWrapper>
            {children}
            <Toaster richColors position="top-right" />
          </NotificationProviderWrapper>
        </AuthProvider>
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
