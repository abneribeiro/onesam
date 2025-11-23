import { eq, asc, and } from 'drizzle-orm';
import { db } from '../database/db';
import { modulos } from '../database/schema';

export interface NewModulo {
  cursoId: number;
  titulo: string;
  descricao?: string;
  ordem?: number;
}

export interface UpdateModulo {
  titulo?: string;
  descricao?: string;
  ordem?: number;
}

export interface Modulo {
  id: number;
  cursoId: number;
  titulo: string;
  descricao: string | null;
  ordem: number;
  dataCriacao: Date;
  dataAtualizacao: Date | null;
}

export class ModuloRepository {
  async create(data: NewModulo): Promise<Modulo> {
    const [modulo] = await db
      .insert(modulos)
      .values({
        cursoId: data.cursoId,
        titulo: data.titulo,
        descricao: data.descricao,
        ordem: data.ordem ?? 0,
      })
      .returning();
    return modulo;
  }

  async findAll(): Promise<Modulo[]> {
    return await db.query.modulos.findMany({
      orderBy: [asc(modulos.ordem)],
    });
  }

  async findByCursoId(cursoId: number, options?: { includeRelations?: boolean }): Promise<Modulo[]> {
    return await db.query.modulos.findMany({
      where: eq(modulos.cursoId, cursoId),
      orderBy: [asc(modulos.ordem)],
      ...(options?.includeRelations && {
        with: {
          aulas: {
            orderBy: (aulas, { asc }) => [asc(aulas.ordem)],
          },
        },
      }),
    });
  }

  async findById(id: number, options?: { includeRelations?: boolean }): Promise<Modulo | undefined> {
    return await db.query.modulos.findFirst({
      where: eq(modulos.id, id),
      ...(options?.includeRelations && {
        with: {
          curso: true,
          aulas: {
            orderBy: (aulas, { asc }) => [asc(aulas.ordem)],
          },
        },
      }),
    });
  }

  async update(id: number, data: UpdateModulo): Promise<Modulo | undefined> {
    const [updated] = await db
      .update(modulos)
      .set({
        ...data,
        dataAtualizacao: new Date(),
      })
      .where(eq(modulos.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(modulos).where(eq(modulos.id, id)).returning();
    return result.length > 0;
  }

  async countByCursoId(cursoId: number): Promise<number> {
    const result = await db.query.modulos.findMany({
      where: eq(modulos.cursoId, cursoId),
    });
    return result.length;
  }

  async reorder(cursoId: number, modulosOrdenados: { id: number; ordem: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const { id, ordem } of modulosOrdenados) {
        await tx
          .update(modulos)
          .set({ ordem, dataAtualizacao: new Date() })
          .where(and(eq(modulos.id, id), eq(modulos.cursoId, cursoId)));
      }
    });
  }
}

export const moduloRepository = new ModuloRepository();
