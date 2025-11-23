export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  MANAGE = 'manage',
  EXPORT = 'export',
}

export enum Resource {
  CURSO = 'curso',
  INSCRICAO = 'inscricao',
  AVALIACAO = 'avaliacao',
  CERTIFICADO = 'certificado',
  CONTEUDO = 'conteudo',
  UTILIZADOR = 'utilizador',
  AREA = 'area',
  CATEGORIA = 'categoria',
  NOTIFICACAO = 'notificacao',
  AUDIT_LOG = 'audit_log',
}

export type Permission = `${Resource}:${Action}`;

export type PermissionMatrix = {
  [key in 'admin' | 'formando']: {
    [resource in Resource]?: Action[];
  };
};
