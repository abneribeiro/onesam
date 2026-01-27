import { db } from '../../db';
import { areas } from '../../schema';
import { areasData } from '../data/static.data';
import logger from '../../../utils/logger';

export async function seedAreas() {
  logger.info('Seeding areas...');

  const insertedAreas = await db.insert(areas).values(areasData).returning();
  logger.info('Areas created', { count: insertedAreas.length });

  return insertedAreas;
}