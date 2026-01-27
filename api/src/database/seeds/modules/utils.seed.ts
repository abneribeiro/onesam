import { db } from '../../db';
import { utilizadores, admins, formandos, areas, categorias, cursos, inscricoes, reviews, notificacoes, account, progressoAulas, aulas, modulos } from '../../schema';
import logger from '../../../utils/logger';

export async function cleanDatabase() {
  logger.info('Cleaning database...');

  // Delete in correct order (respecting foreign key constraints)
  await db.delete(progressoAulas);
  await db.delete(reviews);
  await db.delete(notificacoes);
  await db.delete(aulas);
  await db.delete(modulos);
  await db.delete(inscricoes);
  await db.delete(cursos);
  await db.delete(categorias);
  await db.delete(areas);
  await db.delete(formandos);
  await db.delete(admins);
  await db.delete(account);
  await db.delete(utilizadores);

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
    '"ProgressoAulas_IDProgresso_seq"'
  ];

  for (const sequence of sequences) {
    await db.execute(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
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