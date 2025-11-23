import { Action, Resource, type PermissionMatrix } from '../types/permissions.types';

/**
 * Matriz de permissões por perfil (simplificado: apenas admin e formando)
 */
export const permissions: PermissionMatrix = {
  admin: {
    [Resource.CURSO]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE, Action.EXPORT],
    [Resource.INSCRICAO]: [Action.READ, Action.APPROVE, Action.UPDATE, Action.MANAGE, Action.EXPORT],
    [Resource.AVALIACAO]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.CERTIFICADO]: [Action.CREATE, Action.READ, Action.EXPORT, Action.MANAGE],
    [Resource.CONTEUDO]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.UTILIZADOR]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.AREA]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Resource.CATEGORIA]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Resource.NOTIFICACAO]: [Action.CREATE, Action.READ, Action.MANAGE],
    [Resource.AUDIT_LOG]: [Action.READ, Action.EXPORT],
  },
  formando: {
    [Resource.CURSO]: [Action.READ],
    [Resource.INSCRICAO]: [Action.CREATE, Action.READ],
    [Resource.AVALIACAO]: [Action.READ],
    [Resource.CERTIFICADO]: [Action.READ, Action.EXPORT],
    [Resource.CONTEUDO]: [Action.READ],
    [Resource.UTILIZADOR]: [Action.READ, Action.UPDATE],
    [Resource.AREA]: [Action.READ],
    [Resource.CATEGORIA]: [Action.READ],
    [Resource.NOTIFICACAO]: [Action.READ],
  },
};
