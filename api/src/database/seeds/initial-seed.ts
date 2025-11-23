import { db } from '../db';
import { utilizadores, admins, areas, categorias } from '../schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../lib/auth';

import logger from '../../utils/logger';

export async function seedInitialData() {
  try {
    logger.info('Starting initial seed...');

    // Criar utilizador admin usando Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: 'admin@onesam.pt',
        password: 'Admin@2025',
        name: 'Administrador',
        tipoPerfil: 'admin',
      } as any,
    });

    if (!signUpResult || !signUpResult.user) {
      throw new Error('Failed to create admin user');
    }

    const userId = parseInt(signUpResult.user.id as string, 10);

    // Marcar utilizador como verificado e ativo
    await db.update(utilizadores)
      .set({
        emailVerified: true,
        tipoPerfil: 'admin',
        ativo: true
      })
      .where(eq(utilizadores.id, userId));

    // Criar perfil de admin
    const [adminProfile] = await db.insert(admins).values({
      utilizadorId: userId,
      departamento: 'Administração',
      nivelAcesso: 'super_admin'
    }).returning();

    // Atualizar utilizador com perfilId
    await db.update(utilizadores)
      .set({ perfilId: adminProfile.id })
      .where(eq(utilizadores.id, userId));

    logger.info('Admin user created', { email: 'admin@onesam.pt' });

    const areasData = [
      { nome: 'Tecnologia da Informação', descricao: 'Cursos relacionados com TI e desenvolvimento' },
      { nome: 'Gestão', descricao: 'Cursos de gestão e liderança' },
      { nome: 'Comunicação', descricao: 'Cursos de comunicação e soft skills' },
      { nome: 'Marketing', descricao: 'Cursos de marketing digital e tradicional' }
    ];

    const insertedAreas = await db.insert(areas).values(areasData).returning();
    logger.info('Areas created', { count: insertedAreas.length });

    const categoriasData = [
      { areaId: insertedAreas[0].id, nome: 'Desenvolvimento Web', descricao: 'Frontend, Backend e Fullstack' },
      { areaId: insertedAreas[0].id, nome: 'DevOps', descricao: 'CI/CD, Docker, Kubernetes' },
      { areaId: insertedAreas[1].id, nome: 'Liderança', descricao: 'Gestão de equipas e projetos' },
      { areaId: insertedAreas[2].id, nome: 'Comunicação Eficaz', descricao: 'Apresentações e negociação' }
    ];

    const insertedCategorias = await db.insert(categorias).values(categoriasData).returning();
    logger.info('Categorias created', { count: insertedCategorias.length });

    logger.info('Initial seed completed successfully');

    return {
      admin: signUpResult.user,
      areas: insertedAreas,
      categorias: insertedCategorias
    };
  } catch (error) {
    logger.error('Error seeding initial data', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

if (require.main === module) {
  seedInitialData()
    .then(() => {
      logger.info('Seed script executed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed', error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    });
}
