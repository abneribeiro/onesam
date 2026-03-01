import { seedAreas } from './modules/areas.seed';
import { seedCategorias } from './modules/categorias.seed';
import { seedUtilizadores } from './modules/users.seed';
import { seedCourses, seedModules, seedLessons } from './modules/courses.seed';
import { cleanDatabase, generateSeedSummary } from './modules/utils.seed';
import logger from '../../utils/logger';

const shouldClean = process.argv.includes('--clean');

export async function seedCompleteData() {
  try {
    logger.info('===== Starting complete seed =====');

    if (shouldClean) {
      await cleanDatabase();
    }

    // Seed basic structure
    const areas = await seedAreas();
    const categorias = await seedCategorias(areas);

    // Seed users
    const users = await seedUtilizadores();

    // Seed educational content
    const cursos = await seedCourses(areas, categorias);
    const modulos = await seedModules(cursos);
    const aulas = await seedLessons(modulos);

    const results = {
      areas,
      categorias,
      users,
      cursos,
      modulos,
      aulas
    };

    const summary = generateSeedSummary(results);

    logger.info('===== Complete seed finished successfully =====');
    logger.info('Summary:', summary);

    return results;
  } catch (error) {
    logger.error('Error seeding complete data', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

if (require.main === module) {
  seedCompleteData()
    .then(() => {
      logger.info('Seed script executed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed', error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    });
}