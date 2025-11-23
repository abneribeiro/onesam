import { db } from '../database/db';
import { admins, formandos } from '../database/schema';

export class PerfilRepository {
  async createAdmin(utilizadorId: number, departamento?: string, nivelAcesso: string = 'admin') {
    const [admin] = await db
      .insert(admins)
      .values({
        utilizadorId,
        departamento: departamento || null,
        nivelAcesso,
      })
      .returning();
    return admin;
  }

  async createFormando(
    utilizadorId: number,
    empresa?: string,
    cargo?: string,
    areaInteresse?: string,
    objetivosAprendizagem?: string
  ) {
    const [formando] = await db
      .insert(formandos)
      .values({
        utilizadorId,
        empresa: empresa || null,
        cargo: cargo || null,
        areaInteresse: areaInteresse || null,
        objetivosAprendizagem: objetivosAprendizagem || null,
      })
      .returning();
    return formando;
  }
}

export const perfilRepository = new PerfilRepository();
