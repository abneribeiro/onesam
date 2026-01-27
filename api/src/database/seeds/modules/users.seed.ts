import { db } from '../../db';
import { utilizadores, admins, formandos } from '../../schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../../lib/auth';
import {
  generateFormandosData,
  generateAdminsData
} from '../factories/user.factory';
import logger from '../../../utils/logger';

export async function seedUtilizadores() {
  logger.info('Seeding utilizadores...');

  const formandosData = generateFormandosData();
  const adminsData = generateAdminsData();

  const insertedAdmins = [];
  const insertedFormandos = [];

  // Create admin users using Better Auth
  for (const admin of adminsData) {
    try {
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: admin.email,
          password: 'Admin@2025',
          name: admin.nome,
          tipoPerfil: 'admin',
        } as any,
      });

      if (!signUpResult || !signUpResult.user) {
        logger.error('Failed to create admin user', { email: admin.email });
        continue;
      }

      const userId = parseInt(signUpResult.user.id as string, 10);

      await db.update(utilizadores)
        .set({
          emailVerified: true,
          tipoPerfil: 'admin',
          ativo: true
        })
        .where(eq(utilizadores.id, userId));

      const [adminProfile] = await db.insert(admins).values({
        utilizadorId: userId,
        departamento: admin.departamento,
        nivelAcesso: 'admin'
      }).returning();

      await db.update(utilizadores)
        .set({ perfilId: adminProfile.id })
        .where(eq(utilizadores.id, userId));

      insertedAdmins.push({ user: signUpResult.user, profile: adminProfile });
    } catch (error) {
      logger.error('Error creating admin', { email: admin.email, error });
    }
  }

  // Create formando users using Better Auth
  for (const formando of formandosData) {
    try {
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: formando.email,
          password: 'Formando@123',
          name: formando.nome,
          tipoPerfil: 'formando',
        } as any,
      });

      if (!signUpResult || !signUpResult.user) {
        logger.error('Failed to create formando user', { email: formando.email });
        continue;
      }

      const userId = parseInt(signUpResult.user.id as string, 10);

      await db.update(utilizadores)
        .set({
          emailVerified: true,
          tipoPerfil: 'formando',
          ativo: true
        })
        .where(eq(utilizadores.id, userId));

      const [formandoProfile] = await db.insert(formandos).values({
        utilizadorId: userId,
        empresa: formando.empresa || null,
        cargo: formando.cargo || null,
        areaInteresse: formando.areasInteresse.join(', ') || null,
        objetivosAprendizagem: formando.objetivosProfissionais || null
      }).returning();

      await db.update(utilizadores)
        .set({ perfilId: formandoProfile.id })
        .where(eq(utilizadores.id, userId));

      insertedFormandos.push({ user: signUpResult.user, profile: formandoProfile });
    } catch (error) {
      logger.error('Error creating formando', { email: formando.email, error });
    }
  }

  logger.info('Users created', {
    admins: insertedAdmins.length,
    formandos: insertedFormandos.length
  });

  return {
    formandos: insertedFormandos,
    admins: insertedAdmins
  };
}