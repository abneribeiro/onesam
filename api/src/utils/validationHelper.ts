import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from './logger';

/**
 * Middleware factory para validação com Zod
 * Valida body, query e params simultaneamente
 */
export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const erros = error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensagem: issue.message,
        }));

        logger.warn('Erros de validação Zod', { erros });

        res.status(400).json({
          sucesso: false,
          mensagem: 'Dados inválidos na requisição',
          erros,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Escapa caracteres especiais para uso seguro em SQL LIKE patterns
 * Previne SQL injection através de caracteres especiais do LIKE (%, _, \)
 *
 * @param pattern - String a ser escapada
 * @returns String segura para uso em LIKE
 *
 * @example
 * escapeLikePattern("test%user") // retorna "test\\%user"
 * escapeLikePattern("user_name") // retorna "user\\_name"
 */
export function escapeLikePattern(pattern: string): string {
  if (!pattern) return '';
  return pattern
    .replace(/\\/g, '\\\\')  // Escape backslash first
    .replace(/%/g, '\\%')     // Escape percent
    .replace(/_/g, '\\_');    // Escape underscore
}

/**
 * Sanitiza e prepara uma string para busca LIKE
 * Remove espaços extras e escapa caracteres especiais
 *
 * @param search - Termo de busca
 * @returns String sanitizada e pronta para LIKE
 */
export function sanitizeSearchTerm(search: string): string {
  if (!search) return '';
  const trimmed = search.trim();
  return escapeLikePattern(trimmed);
}

/**
 * Valida se um ID é um número inteiro positivo válido
 */
export function isValidId(id: unknown): id is number {
  if (typeof id === 'number') {
    return Number.isInteger(id) && id > 0;
  }
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && String(parsed) === id;
  }
  return false;
}

/**
 * Converte um ID para número de forma segura
 * Lança erro se o ID não for válido
 */
export function parseId(id: unknown, fieldName = 'ID'): number {
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id;
  }
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  throw new Error(`${fieldName} inválido`);
}
