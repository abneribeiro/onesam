import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

export const validateDto = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Erro de validação no body', {
          path: req.path,
          method: req.method,
          errors,
        });

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

      logger.error('Erro desconhecido na validação do body', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        }
      });
    }
  };
};

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      // Express 5 defines req.query as a getter-only property.
      // Override it with an own data property via Object.defineProperty.
      Object.defineProperty(req, 'query', {
        configurable: true,
        enumerable: true,
        value: validated,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Erro de validação nos query params', {
          path: req.path,
          method: req.method,
          errors,
        });

        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação nos parâmetros de consulta',
            details: errors,
          }
        });
        return;
      }

      logger.error('Erro desconhecido na validação de query params', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        }
      });
    }
  };
};

export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      // Express 5 may define req.params as getter-only.
      // Override it with an own data property via Object.defineProperty.
      Object.defineProperty(req, 'params', {
        configurable: true,
        enumerable: true,
        value: validated,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Erro de validação nos route params', {
          path: req.path,
          method: req.method,
          errors,
        });

        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação nos parâmetros da rota',
            details: errors,
          }
        });
        return;
      }

      logger.error('Erro desconhecido na validação de route params', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        }
      });
    }
  };
};
