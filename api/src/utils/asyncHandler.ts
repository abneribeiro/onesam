import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';

/**
 * Type for async route handlers
 * Supports both regular Request and AuthRequest types
 */
type AsyncRouteHandler<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Wrapper function to handle async operations in Express routes
 * Eliminates the need for repetitive try/catch blocks in controllers
 *
 * @param fn - Async function to wrap
 * @returns Express middleware that handles promise rejections
 *
 * @example
 * ```typescript
 * // Before:
 * export const getUser = async (req: Request, res: Response, next: NextFunction) => {
 *   try {
 *     const user = await userService.getById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 *
 * // After:
 * export const getUser = asyncHandler(async (req: Request, res: Response) => {
 *   const user = await userService.getById(req.params.id);
 *   res.json(user);
 * });
 * ```
 */
export const asyncHandler = <T = Request>(
  fn: AsyncRouteHandler<T>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Specialized async handler for authenticated routes
 * Uses AuthRequest type for better TypeScript support
 */
export const asyncAuthHandler = (
  fn: AsyncRouteHandler<AuthRequest>
) => {
  return asyncHandler<AuthRequest>(fn);
};

/**
 * Async handler with automatic ID parameter validation
 * Validates that req.params.id exists and is a valid number
 *
 * @param fn - Async function that expects a valid ID parameter
 * @returns Express middleware with ID validation
 */
export const asyncHandlerWithId = <T = Request>(
  fn: (req: T & { params: { id: string } }, res: Response, next: NextFunction) => Promise<void | Response>
) => {
  return asyncHandler<T & { params: { id: string } }>((req, res, next) => {
    // Validate ID parameter exists
    if (!req.params.id) {
      const error = new Error('ID é obrigatório');
      (error as any).statusCode = 400;
      throw error;
    }

    // Validate ID is numeric
    if (!/^\d+$/.test(req.params.id)) {
      const error = new Error('ID deve ser um número válido');
      (error as any).statusCode = 400;
      throw error;
    }

    return fn(req, res, next);
  });
};

/**
 * Async handler for bulk operations
 * Validates that request body contains a valid IDs array
 */
export const asyncBulkHandler = <T = Request>(
  fn: (req: T & { body: { ids: number[] } }, res: Response, next: NextFunction) => Promise<void | Response>
) => {
  return asyncHandler<T & { body: { ids: number[] } }>((req, res, next) => {
    // Validate IDs array exists
    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      const error = new Error('Array de IDs é obrigatório');
      (error as any).statusCode = 400;
      throw error;
    }

    // Validate array is not empty
    if (req.body.ids.length === 0) {
      const error = new Error('Pelo menos um ID deve ser fornecido');
      (error as any).statusCode = 400;
      throw error;
    }

    // Validate all IDs are positive numbers
    const invalidIds = req.body.ids.filter(id => !Number.isInteger(id) || id <= 0);
    if (invalidIds.length > 0) {
      const error = new Error('Todos os IDs devem ser números positivos');
      (error as any).statusCode = 400;
      throw error;
    }

    // Limit bulk operations to prevent abuse
    if (req.body.ids.length > 50) {
      const error = new Error('Máximo de 50 itens por operação bulk');
      (error as any).statusCode = 400;
      throw error;
    }

    return fn(req, res, next);
  });
};

/**
 * Creates a timeout wrapper for async handlers
 * Useful for operations that might hang indefinitely
 *
 * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
 * @returns Function that wraps async handlers with timeout
 */
export const withTimeout = (timeoutMs: number = 30000) => {
  return <T = Request>(fn: AsyncRouteHandler<T>) => {
    return asyncHandler<T>(async (req, res, next) => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const error = new Error('Operação excedeu o tempo limite');
          (error as any).statusCode = 408;
          reject(error);
        }, timeoutMs);
      });

      return Promise.race([
        fn(req, res, next),
        timeoutPromise
      ]);
    });
  };
};

/**
 * Type guard to check if response was already sent
 * Useful in handlers that might conditionally send responses
 */
export const isResponseSent = (res: Response): boolean => {
  return res.headersSent;
};

/**
 * Utility to create conditional async handlers
 * Only executes the handler if a condition is met
 */
export const conditionalHandler = <T = Request>(
  condition: (req: T) => boolean,
  fn: AsyncRouteHandler<T>,
  fallback?: AsyncRouteHandler<T>
) => {
  return asyncHandler<T>((req, res, next) => {
    if (condition(req)) {
      return fn(req, res, next);
    } else if (fallback) {
      return fallback(req, res, next);
    } else {
      const error = new Error('Condição não atendida');
      (error as any).statusCode = 400;
      throw error;
    }
  });
};