import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import logger from '../utils/logger';
import { isBetterAuthUser, type BetterAuthUser } from '../types/auth.types';

export interface AuthenticatedRequest extends Request {
  utilizador?: {
    id: number;
    nome: string;
    email: string;
    tipoPerfil: 'admin' | 'formando';
    perfilId?: number;
    ativo: boolean;
    avatar?: string;
  };
}

/**
 * Middleware de autenticação usando Better Auth
 * Verifica a sessão e extrai informações do usuário de forma type-safe
 */
export const betterAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: await fromNodeHeaders(req.headers)
    });

    if (!session?.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Não autenticado',
        }
      });
      return;
    }

    // Type-safe access usando type guard
    if (!isBetterAuthUser(session.user)) {
      logger.error('Invalid user object from session', {
        userId: 'id' in session.user ? session.user.id : 'unknown',
      });
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Sessão inválida',
        }
      });
      return;
    }

    const user: BetterAuthUser = session.user;

    // Verificar se o usuário tem tipoPerfil definido
    if (!user.tipoPerfil) {
      logger.warn('User without tipoPerfil', { userId: user.id, email: user.email });
      res.status(403).json({
        success: false,
        error: {
          code: 'INCOMPLETE_PROFILE',
          message: 'Perfil de usuário incompleto. Contacte o administrador.',
        }
      });
      return;
    }

    req.utilizador = {
      id: parseInt(user.id, 10),
      nome: user.name,
      email: user.email,
      tipoPerfil: user.tipoPerfil,
      perfilId: user.perfilId,
      ativo: user.ativo ?? true,
      avatar: user.image || undefined,
    };

    next();
  } catch (error) {
    logger.error('Error in betterAuthMiddleware:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(401).json({
      success: false,
      error: {
        code: 'SESSION_ERROR',
        message: 'Erro ao verificar sessão',
      }
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia a requisição se não houver sessão, mas popula req.utilizador se houver
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: await fromNodeHeaders(req.headers)
    });

    if (session?.user && isBetterAuthUser(session.user) && session.user.tipoPerfil) {
      req.utilizador = {
        id: parseInt(session.user.id, 10),
        nome: session.user.name,
        email: session.user.email,
        tipoPerfil: session.user.tipoPerfil,
        perfilId: session.user.perfilId,
        ativo: session.user.ativo ?? true,
        avatar: session.user.image || undefined,
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem autenticação
    logger.debug('Optional auth failed, continuing without authentication');
    next();
  }
};

export default betterAuthMiddleware;
