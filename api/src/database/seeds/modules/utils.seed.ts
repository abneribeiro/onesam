import { db } from '../../db';
import {
  utilizadores, admins, formandos, areas, categorias, cursos, inscricoes,
  reviews, notificacoes, account, progressoAulas, aulas, modulos, session,
  auditLogs, verification, quizzes, quizPerguntas, quizTentativas, certificados
} from '../../schema';
import logger from '../../../utils/logger';

export async function cleanDatabase() {
  logger.info('Cleaning database...');

  // Delete in correct order (respecting foreign key constraints)
  // Most dependent tables first, independent tables last
  // Use try-catch for tables that might not exist yet
  const tablesToDelete = [
    { table: quizTentativas, name: 'QuizTentativas' },
    { table: quizPerguntas, name: 'QuizPerguntas' },
    { table: quizzes, name: 'Quizzes' },
    { table: certificados, name: 'Certificados' },
    { table: progressoAulas, name: 'ProgressoAulas' },
    { table: reviews, name: 'Reviews' },
    { table: notificacoes, name: 'Notificacoes' },
    { table: aulas, name: 'Aulas' },
    { table: modulos, name: 'Modulos' },
    { table: inscricoes, name: 'Inscricoes' },
    { table: cursos, name: 'Cursos' },
    { table: categorias, name: 'Categorias' },
    { table: areas, name: 'Areas' },
    { table: session, name: 'Session' },
    { table: auditLogs, name: 'AuditLogs' },
    { table: formandos, name: 'Formandos' },
    { table: admins, name: 'Admins' },
    { table: account, name: 'Account' },
    { table: utilizadores, name: 'Utilizadores' },
    { table: verification, name: 'Verification' }
  ];

  for (const { table, name } of tablesToDelete) {
    try {
      await db.delete(table);
      logger.info(`Cleaned table: ${name}`);
    } catch (error) {
      logger.warn(`Table ${name} might not exist or already empty: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Reset auto-increment sequences to start from 1
  const sequences = [
    '"Areas_IDArea_seq"',
    '"Categorias_IDCategoria_seq"',
    '"Utilizadores_IDUtilizador_seq"',
    '"Cursos_IDCurso_seq"',
    '"Modulos_IDModulo_seq"',
    '"Aulas_IDAula_seq"',
    '"Inscricoes_IDInscricao_seq"',
    '"Reviews_IDReview_seq"',
    '"Notificacoes_IDNotificacao_seq"',
    '"ProgressoAulas_IDProgresso_seq"',
    '"Quizzes_IDQuiz_seq"',
    '"QuizPerguntas_IDPergunta_seq"',
    '"QuizTentativas_IDTentativa_seq"',
    '"Certificados_IDCertificado_seq"',
    '"AuditLogs_IDAuditLog_seq"'
  ];

  for (const sequence of sequences) {
    try {
      await db.execute(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
      logger.info(`Reset sequence: ${sequence}`);
    } catch (error) {
      logger.warn(`Sequence ${sequence} might not exist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logger.info('Database cleaned and sequences reset');
}

export function generateSeedSummary(results: any) {
  return {
    areas: results.areas?.length || 0,
    categorias: results.categorias?.length || 0,
    admins: results.users?.admins?.length || 0,
    formandos: results.users?.formandos?.length || 0,
    cursos: results.cursos?.length || 0,
    modulos: results.modulos?.length || 0,
    aulas: results.aulas?.length || 0,
    inscricoes: results.inscricoes?.length || 0,
    reviews: results.reviews?.length || 0,
    notificacoes: results.notificacoes?.length || 0,
    progressoAulas: results.progressoAulas?.length || 0
  };
}