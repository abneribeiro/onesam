import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { Action, Resource } from '../types/permissions.types';
import { permissions } from '../config/permissions';
import logger from '../utils/logger';

/**
 * Verifica se um utilizador tem permissão para executar uma ação em um recurso
 */
export function hasPermission(
  tipoPerfil: 'admin' | 'formando',
  resource: Resource,
  action: Action
): boolean {
  const perfilPermissions = permissions[tipoPerfil];
  const resourceActions = perfilPermissions[resource];

  if (!resourceActions) {
    return false;
  }

  return resourceActions.includes(action);
}

/**
 * Middleware RBAC - verifica permissões
 */
export const can = (resource: Resource, action: Action) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.utilizador) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' }
        });
        return;
      }

      if (!req.utilizador.ativo) {
        res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_DISABLED', message: 'Conta desativada. Contacte o administrador.' }
        });
        return;
      }

      const hasAccess = hasPermission(req.utilizador.tipoPerfil, resource, action);

      if (!hasAccess) {
        logger.warn('Acesso negado', {
          utilizadorId: req.utilizador.id,
          tipoPerfil: req.utilizador.tipoPerfil,
          resource,
          action,
          path: req.path,
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado. Permissões insuficientes.',
            details: {
              required: `${resource}:${action}`,
              userRole: req.utilizador.tipoPerfil,
            }
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Erro no middleware RBAC', {
        error: error instanceof Error ? error.message : 'Unknown error',
        resource,
        action,
      });

      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' }
      });
    }
  };
};

/**
 * Middleware genérico para restringir acesso por perfil
 * Reduz duplicação de código e facilita manutenção
 */
const requireRole = (role: 'admin' | 'formando', mensagem?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.utilizador) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' }
      });
      return;
    }

    if (!req.utilizador.ativo) {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Conta desativada. Contacte o administrador.' }
      });
      return;
    }

    if (req.utilizador.tipoPerfil !== role) {
      const defaultMessages = {
        admin: 'Acesso permitido apenas para administradores',
        formando: 'Acesso permitido apenas para formandos'
      };

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: mensagem || defaultMessages[role]
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para permitir apenas administradores
 */
export const adminOnly = requireRole('admin');

/**
 * Middleware para permitir apenas formandos
 */
export const formandoOnly = requireRole('formando');
