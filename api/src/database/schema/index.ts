import { pgTable, serial, varchar, text, boolean, timestamp, integer, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const estadoCursoEnum = pgEnum('estado_curso_enum', ['planeado', 'em_curso', 'terminado', 'arquivado']);
export const nivelCursoEnum = pgEnum('nivel_curso_enum', ['iniciante', 'intermedio', 'avancado']);
export const estadoInscricaoEnum = pgEnum('estado_inscricao_enum', ['pendente', 'aceite', 'rejeitada', 'cancelada']);
export const tipoPerfilEnum = pgEnum('tipo_perfil_enum', ['admin', 'formando']);
export const tipoNotificacaoEnum = pgEnum('tipo_notificacao_enum', ['inscricao_aprovada', 'inscricao_rejeitada', 'novo_curso', 'lembrete', 'sistema']);
export const tipoConteudoEnum = pgEnum('tipo_conteudo_enum', ['video', 'documento', 'link', 'texto', 'quiz']);

export const utilizadores = pgTable('Utilizadores', {
  id: serial('IDUtilizador').primaryKey(),
  nome: varchar('Nome', { length: 255 }).notNull(),
  email: varchar('Email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('EmailVerified').default(false).notNull(),
  tipoPerfil: tipoPerfilEnum('TipoPerfil').notNull(),
  perfilId: integer('PerfilId'),
  avatar: varchar('Avatar', { length: 500 }),
  ativo: boolean('Ativo').default(false).notNull(),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_utilizadores_perfil_id').on(table.perfilId, table.tipoPerfil),
]);

export const admins = pgTable('Admins', {
  id: serial('IDAdmin').primaryKey(),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }).unique(),
  departamento: varchar('Departamento', { length: 255 }),
  nivelAcesso: varchar('NivelAcesso', { length: 50 }).default('admin').notNull(),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_admins_utilizador').on(table.utilizadorId),
]);

export const formandos = pgTable('Formandos', {
  id: serial('IDFormando').primaryKey(),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }).unique(),
  empresa: varchar('Empresa', { length: 255 }),
  cargo: varchar('Cargo', { length: 255 }),
  areaInteresse: varchar('AreaInteresse', { length: 255 }),
  objetivosAprendizagem: text('ObjetivosAprendizagem'),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
});

export const areas = pgTable('Areas', {
  id: serial('IDArea').primaryKey(),
  nome: varchar('NomeArea', { length: 255 }).notNull(),
  descricao: text('Descricao'),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
});

export const categorias = pgTable('Categorias', {
  id: serial('IDCategoria').primaryKey(),
  areaId: integer('IDArea').references(() => areas.id, { onDelete: 'set null' }),
  nome: varchar('NomeCategoria', { length: 255 }).notNull(),
  descricao: text('Descricao'),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
});

export const cursos = pgTable('Cursos', {
  id: serial('IDCurso').primaryKey(),
  areaId: integer('IDArea').references(() => areas.id, { onDelete: 'set null' }),
  categoriaId: integer('IDCategoria').references(() => categorias.id, { onDelete: 'set null' }),
  nome: varchar('NomeCurso', { length: 255 }).notNull(),
  descricao: text('Descricao'),
  imagemCurso: varchar('ImagemCurso', { length: 500 }),
  certificado: boolean('Certificado').default(false).notNull(),
  dataInicio: timestamp('DataInicio').notNull(),
  dataFim: timestamp('DataFim').notNull(),
  dataLimiteInscricao: timestamp('DataLimiteInscricao').notNull(),
  estado: estadoCursoEnum('Estado').default('planeado').notNull(),
  visivel: boolean('Visivel').default(true).notNull(),
  nivel: nivelCursoEnum('Nivel').default('iniciante').notNull(),
  limiteVagas: integer('LimiteVagas'),
  cargaHoraria: integer('CargaHoraria'),
  notaMinimaAprovacao: integer('NotaMinimaAprovacao').default(10).notNull(),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_cursos_estado_visivel').on(table.estado, table.visivel),
  index('idx_cursos_data_inicio').on(table.dataInicio),
]);

export const inscricoes = pgTable('Inscricoes', {
  id: serial('IDInscricao').primaryKey(),
  cursoId: integer('IDCurso').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
  dataInscricao: timestamp('DataInscricao').defaultNow().notNull(),
  estado: estadoInscricaoEnum('Estado').default('pendente').notNull(),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_inscricoes_utilizador_estado').on(table.utilizadorId, table.estado),
  index('idx_inscricoes_curso_estado').on(table.cursoId, table.estado),
]);

export const session = pgTable('Session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: integer('userId').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_session_userId').on(table.userId),
]);

export const account = pgTable('Account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: integer('userId').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('idx_account_userId').on(table.userId),
]);

export const verification = pgTable('Verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const auditLogs = pgTable('AuditLogs', {
  id: serial('IDAuditLog').primaryKey(),
  utilizadorId: integer('IDUtilizador').references(() => utilizadores.id, { onDelete: 'set null' }),
  actionType: varchar('ActionType', { length: 50 }).notNull(),
  entityType: varchar('EntityType', { length: 50 }).notNull(),
  entityId: integer('EntityId'),
  changesJson: text('ChangesJson'),
  ipAddress: varchar('IpAddress', { length: 45 }),
  userAgent: varchar('UserAgent', { length: 500 }),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
}, (table) => [
  index('idx_auditlogs_utilizador').on(table.utilizadorId),
  index('idx_auditlogs_action').on(table.actionType),
  index('idx_auditlogs_entity').on(table.entityType, table.entityId),
  index('idx_auditlogs_data').on(table.dataCriacao),
]);

export const notificacoes = pgTable('Notificacoes', {
  id: serial('IDNotificacao').primaryKey(),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
  tipo: tipoNotificacaoEnum('Tipo').notNull(),
  titulo: varchar('Titulo', { length: 255 }).notNull(),
  mensagem: text('Mensagem').notNull(),
  lida: boolean('Lida').default(false).notNull(),
  linkAcao: varchar('LinkAcao', { length: 500 }),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataLeitura: timestamp('DataLeitura'),
}, (table) => [
  index('idx_notificacoes_utilizador_lida').on(table.utilizadorId, table.lida),
  index('idx_notificacoes_data').on(table.dataCriacao),
]);

export const modulos = pgTable('Modulos', {
  id: serial('IDModulo').primaryKey(),
  cursoId: integer('IDCurso').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  titulo: varchar('Titulo', { length: 255 }).notNull(),
  descricao: text('Descricao'),
  ordem: integer('Ordem').notNull().default(0),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_modulos_curso').on(table.cursoId),
  index('idx_modulos_curso_ordem').on(table.cursoId, table.ordem),
]);

export const aulas = pgTable('Aulas', {
  id: serial('IDAula').primaryKey(),
  moduloId: integer('IDModulo').notNull().references(() => modulos.id, { onDelete: 'cascade' }),
  titulo: varchar('Titulo', { length: 255 }).notNull(),
  descricao: text('Descricao'),
  tipo: tipoConteudoEnum('Tipo').notNull(),
  conteudo: text('Conteudo'), // Para texto/HTML
  url: varchar('URL', { length: 1000 }), // Para vídeos/links/documentos
  duracao: integer('Duracao'), // Duração em minutos
  ordem: integer('Ordem').notNull().default(0),
  obrigatoria: boolean('Obrigatoria').default(true).notNull(),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_aulas_modulo').on(table.moduloId),
  index('idx_aulas_modulo_ordem').on(table.moduloId, table.ordem),
]);

export const progressoAulas = pgTable('ProgressoAulas', {
  id: serial('IDProgresso').primaryKey(),
  aulaId: integer('IDAula').notNull().references(() => aulas.id, { onDelete: 'cascade' }),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
  concluida: boolean('Concluida').default(false).notNull(),
  dataConclusao: timestamp('DataConclusao'),
  tempoGasto: integer('TempoGasto'), // Tempo gasto em minutos
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_progresso_aula').on(table.aulaId),
  index('idx_progresso_utilizador').on(table.utilizadorId),
  index('idx_progresso_utilizador_aula').on(table.utilizadorId, table.aulaId),
  unique('unique_aula_utilizador').on(table.aulaId, table.utilizadorId),
]);

export const utilizadoresRelations = relations(utilizadores, ({ one, many }) => ({
  admin: one(admins, {
    fields: [utilizadores.id],
    references: [admins.utilizadorId],
  }),
  formando: one(formandos, {
    fields: [utilizadores.id],
    references: [formandos.utilizadorId],
  }),
  inscricoes: many(inscricoes),
  notificacoes: many(notificacoes),
  reviews: many(reviews),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  utilizador: one(utilizadores, {
    fields: [admins.utilizadorId],
    references: [utilizadores.id],
  }),
}));

export const formandosRelations = relations(formandos, ({ one, many }) => ({
  utilizador: one(utilizadores, {
    fields: [formandos.utilizadorId],
    references: [utilizadores.id],
  }),
  inscricoes: many(inscricoes),
}));

export const areasRelations = relations(areas, ({ many }) => ({
  categorias: many(categorias),
  cursos: many(cursos),
}));

export const categoriasRelations = relations(categorias, ({ one, many }) => ({
  area: one(areas, {
    fields: [categorias.areaId],
    references: [areas.id],
  }),
  cursos: many(cursos),
}));

export const cursosRelations = relations(cursos, ({ one, many }) => ({
  area: one(areas, {
    fields: [cursos.areaId],
    references: [areas.id],
  }),
  categoria: one(categorias, {
    fields: [cursos.categoriaId],
    references: [categorias.id],
  }),
  inscricoes: many(inscricoes),
  modulos: many(modulos),
  reviews: many(reviews),
}));

export const inscricoesRelations = relations(inscricoes, ({ one }) => ({
  curso: one(cursos, {
    fields: [inscricoes.cursoId],
    references: [cursos.id],
  }),
  utilizador: one(utilizadores, {
    fields: [inscricoes.utilizadorId],
    references: [utilizadores.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  utilizador: one(utilizadores, {
    fields: [session.userId],
    references: [utilizadores.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  utilizador: one(utilizadores, {
    fields: [account.userId],
    references: [utilizadores.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  utilizador: one(utilizadores, {
    fields: [auditLogs.utilizadorId],
    references: [utilizadores.id],
  }),
}));

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  utilizador: one(utilizadores, {
    fields: [notificacoes.utilizadorId],
    references: [utilizadores.id],
  }),
}));

export const modulosRelations = relations(modulos, ({ one, many }) => ({
  curso: one(cursos, {
    fields: [modulos.cursoId],
    references: [cursos.id],
  }),
  aulas: many(aulas),
}));

export const aulasRelations = relations(aulas, ({ one, many }) => ({
  modulo: one(modulos, {
    fields: [aulas.moduloId],
    references: [modulos.id],
  }),
  progressos: many(progressoAulas),
}));

export const progressoAulasRelations = relations(progressoAulas, ({ one }) => ({
  aula: one(aulas, {
    fields: [progressoAulas.aulaId],
    references: [aulas.id],
  }),
  utilizador: one(utilizadores, {
    fields: [progressoAulas.utilizadorId],
    references: [utilizadores.id],
  }),
}));

export const reviews = pgTable('Reviews', {
  id: serial('IDReview').primaryKey(),
  cursoId: integer('IDCurso').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  utilizadorId: integer('IDUtilizador').notNull().references(() => utilizadores.id, { onDelete: 'cascade' }),
  rating: integer('Rating').notNull(), // 1-5 estrelas
  comentario: text('Comentario'),
  dataCriacao: timestamp('DataCriacao').defaultNow().notNull(),
  dataAtualizacao: timestamp('DataAtualizacao'),
}, (table) => [
  index('idx_reviews_curso').on(table.cursoId),
  index('idx_reviews_utilizador').on(table.utilizadorId),
  index('idx_reviews_rating').on(table.rating),
  unique('unique_curso_utilizador').on(table.cursoId, table.utilizadorId),
]);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  curso: one(cursos, {
    fields: [reviews.cursoId],
    references: [cursos.id],
  }),
  utilizador: one(utilizadores, {
    fields: [reviews.utilizadorId],
    references: [utilizadores.id],
  }),
}));
