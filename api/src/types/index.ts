// Re-export all shared types
export * from './shared.types';
export * from './auth.types';
export * from './permissions.types';

// Add database schema type exports
import { utilizadores, areas, categorias, cursos, inscricoes, notificacoes } from '../database/schema';

// Infer types from Drizzle ORM schemas
export type Utilizador = typeof utilizadores.$inferSelect;
export type NewUtilizador = typeof utilizadores.$inferInsert;

export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;

export type Categoria = typeof categorias.$inferSelect;
export type NewCategoria = typeof categorias.$inferInsert;

export type Curso = typeof cursos.$inferSelect;
export type NewCurso = typeof cursos.$inferInsert;

export type Inscricao = typeof inscricoes.$inferSelect;
export type NewInscricao = typeof inscricoes.$inferInsert;

export type Notificacao = typeof notificacoes.$inferSelect;
export type NewNotificacao = typeof notificacoes.$inferInsert;

// Create alias for backwards compatibility
export type { AuthRequest as AuthenticatedRequest } from './auth.types';
