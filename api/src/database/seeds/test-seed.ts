import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../db';
import {
  utilizadores, admins, formandos, areas, categorias,
  cursos, modulos, aulas, account,
} from '../schema';
import { hashPassword } from '../../utils/password';

export interface TestSeedData {
  admin: {
    utilizador: typeof utilizadores.$inferSelect;
    perfil: typeof admins.$inferSelect;
  };
  formando: {
    utilizador: typeof utilizadores.$inferSelect;
    perfil: typeof formandos.$inferSelect;
  };
  area: typeof areas.$inferSelect;
  categoria: typeof categorias.$inferSelect;
  curso: typeof cursos.$inferSelect;
  modulo: typeof modulos.$inferSelect;
  aula: typeof aulas.$inferSelect;
}

const TEST_PASSWORD = 'TestPassword123!';

export async function seedTestData(): Promise<TestSeedData> {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const [adminUser] = await db.insert(utilizadores).values({
    nome: 'Test Admin',
    email: 'admin@test.com',
    emailVerified: true,
    tipoPerfil: 'admin',
    ativo: true,
  }).returning();

  const [adminPerfil] = await db.insert(admins).values({
    utilizadorId: adminUser.id,
    departamento: 'TI',
    nivelAcesso: 'admin',
  }).returning();

  await db.update(utilizadores)
    .set({ perfilId: adminPerfil.id })
    .where(eq(utilizadores.id, adminUser.id));

  await db.insert(account).values({
    id: randomUUID(),
    accountId: String(adminUser.id),
    providerId: 'credential',
    userId: adminUser.id,
    password: passwordHash,
  });

  const [formandoUser] = await db.insert(utilizadores).values({
    nome: 'Test Formando',
    email: 'formando@test.com',
    emailVerified: true,
    tipoPerfil: 'formando',
    ativo: true,
  }).returning();

  const [formandoPerfil] = await db.insert(formandos).values({
    utilizadorId: formandoUser.id,
    empresa: 'Test Corp',
    cargo: 'Developer',
  }).returning();

  await db.update(utilizadores)
    .set({ perfilId: formandoPerfil.id })
    .where(eq(utilizadores.id, formandoUser.id));

  await db.insert(account).values({
    id: randomUUID(),
    accountId: String(formandoUser.id),
    providerId: 'credential',
    userId: formandoUser.id,
    password: passwordHash,
  });

  const [area] = await db.insert(areas).values({
    nome: 'Tecnologia',
    descricao: 'Area de tecnologia para testes',
  }).returning();

  const [categoria] = await db.insert(categorias).values({
    areaId: area.id,
    nome: 'Programacao',
    descricao: 'Categoria de programacao para testes',
  }).returning();

  const [curso] = await db.insert(cursos).values({
    areaId: area.id,
    categoriaId: categoria.id,
    nome: 'Curso de Teste',
    descricao: 'Curso criado automaticamente para testes',
    dataInicio: oneMonthFromNow,
    dataFim: twoMonthsFromNow,
    dataLimiteInscricao: oneMonthFromNow,
    estado: 'em_curso',
    nivel: 'iniciante',
    cargaHoraria: 40,
    limiteVagas: 30,
    visivel: true,
  }).returning();

  const [modulo] = await db.insert(modulos).values({
    cursoId: curso.id,
    titulo: 'Modulo de Teste',
    descricao: 'Modulo criado automaticamente para testes',
    ordem: 1,
  }).returning();

  const [aula] = await db.insert(aulas).values({
    moduloId: modulo.id,
    titulo: 'Aula de Teste',
    descricao: 'Aula criada automaticamente para testes',
    tipo: 'video',
    url: 'https://example.com/video-teste.mp4',
    duracao: 30,
    ordem: 1,
  }).returning();

  const [updatedAdmin] = await db.select().from(utilizadores).where(eq(utilizadores.id, adminUser.id));
  const [updatedFormando] = await db.select().from(utilizadores).where(eq(utilizadores.id, formandoUser.id));

  return {
    admin: { utilizador: updatedAdmin, perfil: adminPerfil },
    formando: { utilizador: updatedFormando, perfil: formandoPerfil },
    area,
    categoria,
    curso,
    modulo,
    aula,
  };
}
