import { db } from '../../db';
import { categorias } from '../../schema';
import { buildCategoriasData } from '../data/static.data';
import logger from '../../../utils/logger';

export async function seedCategorias(areasInserted: any[]) {
  logger.info('Seeding categorias...');

  const categoriasData = buildCategoriasData(areasInserted);
  const insertedCategorias = await db.insert(categorias).values(categoriasData).returning();
  logger.info('Categorias created', { count: insertedCategorias.length });

  return insertedCategorias;
}