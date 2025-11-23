import type { Request } from 'express';
import type { TipoPerfil } from './index';

export interface UtilizadorAuth {
  id: number;
  nome: string;
  email: string;
  avatar: string | null;
  ativo: boolean;
  tipoPerfil: TipoPerfil;
  perfilId: number;
}

export interface AuthRequest extends Request {
  utilizador?: UtilizadorAuth;
  token?: string;
  requestId?: string;
  startTime?: number;
}

/**
 * Interface para o usuário retornado pelo Better Auth
 * Garante type-safety ao acessar campos customizados
 */
export interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Campos customizados
  tipoPerfil?: TipoPerfil;
  perfilId?: number;
  ativo?: boolean;
}

/**
 * Type guard para verificar se o objeto é um BetterAuthUser válido
 */
export function isBetterAuthUser(user: unknown): user is BetterAuthUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    typeof (user as BetterAuthUser).id === 'string' &&
    typeof (user as BetterAuthUser).email === 'string'
  );
}
