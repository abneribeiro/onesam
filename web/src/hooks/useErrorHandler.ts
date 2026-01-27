import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { extractErrorMessage, extractValidationErrors } from '@/lib/errorHandler';
import type { ValidationError } from '@/lib/errorHandler';

export interface UseErrorHandlerReturn {
  error: string | null;
  validationErrors: ValidationError[];
  isLoading: boolean;
  clearError: () => void;
  handleError: (error: unknown, operation?: string) => void;
  executeAsync: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      operation?: string;
      showToast?: boolean;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    }
  ) => Promise<T | null>;
}

/**
 * Hook for consistent error handling across the application
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors([]);
  }, []);

  const handleError = useCallback((error: unknown, operation = 'executar operação') => {
    const message = extractErrorMessage(error, `Erro ao ${operation}`);
    const validationErrs = extractValidationErrors(error);

    setError(message);
    setValidationErrors(validationErrs);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service (e.g., Sentry)
      // For now, we'll rely on external monitoring to capture errors
    }
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      operation?: string;
      showToast?: boolean;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    } = {}
  ): Promise<T | null> => {
    const {
      operation = 'executar operação',
      showToast = true,
      onSuccess,
      onError,
    } = options;

    try {
      clearError();
      setIsLoading(true);

      const result = await asyncFn();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      handleError(error, operation);

      if (showToast) {
        const message = extractErrorMessage(error, `Erro ao ${operation}`);
        toast.error(message);
      }

      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    validationErrors,
    isLoading,
    clearError,
    handleError,
    executeAsync,
  };
}

/**
 * Hook for handling errors in mutations (create, update, delete operations)
 */
export function useMutationErrorHandler() {
  const { handleError, executeAsync } = useErrorHandler();

  const executeMutation = useCallback(async <T>(
    mutationFn: () => Promise<T>,
    options: {
      operation?: string;
      successMessage?: string;
      onSuccess?: (result: T) => void;
    } = {}
  ): Promise<T | null> => {
    const { operation, successMessage, onSuccess } = options;

    return executeAsync(mutationFn, {
      operation,
      showToast: true,
      onSuccess: (result) => {
        if (successMessage) {
          toast.success(successMessage);
        }
        if (onSuccess) {
          onSuccess(result);
        }
      },
    });
  }, [executeAsync]);

  return {
    handleError,
    executeMutation,
  };
}

/**
 * Hook specifically for handling query errors with retry functionality
 */
export function useQueryErrorHandler() {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const shouldRetry = useCallback((error: unknown): boolean => {
    // Don't retry on client errors (4xx)
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as any).response;
      if (response?.status >= 400 && response?.status < 500) {
        return false;
      }
    }

    return retryCount < maxRetries;
  }, [retryCount]);

  const handleQueryError = useCallback((error: unknown, queryKey?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Query error:', { error, queryKey, retryCount });
    }

    // Don't show toast for network errors that will be retried
    if (shouldRetry(error)) {
      setRetryCount(prev => prev + 1);
      return;
    }

    // Show error toast for non-retryable errors
    const message = extractErrorMessage(error, 'carregar dados');
    toast.error(message);

    setRetryCount(0);
  }, [retryCount, shouldRetry]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    handleQueryError,
    shouldRetry,
    retryCount,
    resetRetry,
  };
}