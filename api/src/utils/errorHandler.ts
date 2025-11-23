import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from './logger';
import type { AuthRequest } from '../types/auth.types';

/**
 * Interface para erros com código de status HTTP
 */
interface HttpError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
}

/**
 * Interface para erros de banco de dados (PostgreSQL)
 */
interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

/**
 * Type guard para verificar se é um erro HTTP
 */
function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'statusCode' in error;
}

/**
 * Type guard para verificar se é um erro de banco de dados
 */
function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as DatabaseError).code === 'string'
  );
}

export class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'CUSTOM_ERROR'
  ) {
    super(message);
    this.name = 'CustomError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Classe de erro para erros de negócio
 * Use para erros previsíveis que devem retornar um status específico
 */
export class BusinessError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'BUSINESS_ERROR',
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global para tratamento de erros
 * Tipagem correta para evitar uso de `any`
 */
export const errorHandler = (
  err: Error | HttpError | z.ZodError | DatabaseError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const authReq = req as AuthRequest;

  // Log estruturado do erro
  logger.error('Error intercepted', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode: isHttpError(err) ? err.statusCode : undefined,
    code: isDatabaseError(err) ? err.code : undefined,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    userId: authReq.utilizador?.id
  });

  // Erros de validação Zod
  if (err instanceof z.ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        details: errors,
      }
    });
    return;
  }

  // Erros de negócio customizados
  if (err instanceof BusinessError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      }
    });
    return;
  }

  // Erros customizados com código HTTP
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      }
    });
    return;
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
      }
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
      }
    });
    return;
  }

  // Erros de constraint do PostgreSQL
  if (isDatabaseError(err) && err.code?.startsWith('23')) {
    let message = 'Erro de validação no banco de dados';
    if (err.code === '23505') {
      message = 'Este registro já existe';
    } else if (err.code === '23503') {
      message = 'Referência inválida';
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_CONSTRAINT',
        message,
        details: process.env.NODE_ENV === 'development' ? err.detail : undefined,
      }
    });
    return;
  }

  // Erros de JSON inválido
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSON inválido na requisição',
      }
    });
    return;
  }

  // Erro genérico com status code
  const statusCode = isHttpError(err) ? (err.statusCode || 500) : 500;
  const message = process.env.NODE_ENV === 'development'
    ? err.message || 'Erro interno do servidor'
    : 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    }
  });
};

/**
 * Middleware para lidar com rotas não encontradas
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rota não encontrada - ${req.originalUrl}`,
    }
  });
};
