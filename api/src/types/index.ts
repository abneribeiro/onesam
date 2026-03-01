// Re-export all shared types
export * from './shared.types';
export * from './auth.types';
export * from './permissions.types';

// Add database schema type exports
import {
  utilizadores,
  areas,
  categorias,
  cursos,
  inscricoes,
  notificacoes,
  quizzes,
  quizPerguntas,
  quizTentativas,
  certificados
} from '../database/schema';

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

// Quiz System Types
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type QuizPergunta = typeof quizPerguntas.$inferSelect;
export type NewQuizPergunta = typeof quizPerguntas.$inferInsert;

export type QuizTentativa = typeof quizTentativas.$inferSelect;
export type NewQuizTentativa = typeof quizTentativas.$inferInsert;

// Certificate System Types
export type Certificado = typeof certificados.$inferSelect;
export type NewCertificado = typeof certificados.$inferInsert;

// Quiz-specific types for frontend
export interface QuizOpcao {
  texto: string;
  indice: number;
}

export interface QuizPerguntaCompleta extends QuizPergunta {
  opcoes: QuizOpcao[];
}

export interface QuizCompleto extends Quiz {
  perguntas: QuizPerguntaCompleta[];
}

export interface QuizResposta {
  perguntaId: number;
  respostaSelecionada: number;
}

export interface QuizSubmissao {
  quizId: number;
  respostas: QuizResposta[];
}

// Create alias for backwards compatibility
export type { AuthRequest as AuthenticatedRequest } from './auth.types';
