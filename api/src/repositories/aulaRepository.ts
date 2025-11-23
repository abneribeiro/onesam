import { eq, and, asc } from 'drizzle-orm';
import { db } from '../database/db';
import { aulas, progressoAulas } from '../database/schema';

export type TipoConteudo = 'video' | 'documento' | 'link' | 'texto' | 'quiz';

export interface NewAula {
  moduloId: number;
  titulo: string;
  descricao?: string;
  tipo: TipoConteudo;
  conteudo?: string;
  url?: string;
  duracao?: number;
  ordem?: number;
  obrigatoria?: boolean;
}

export interface UpdateAula {
  titulo?: string;
  descricao?: string;
  tipo?: TipoConteudo;
  conteudo?: string;
  url?: string;
  duracao?: number;
  ordem?: number;
  obrigatoria?: boolean;
}

export interface Aula {
  id: number;
  moduloId: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoConteudo;
  conteudo: string | null;
  url: string | null;
  duracao: number | null;
  ordem: number;
  obrigatoria: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date | null;
}

export interface ProgressoAula {
  id: number;
  aulaId: number;
  utilizadorId: number;
  concluida: boolean;
  dataConclusao: Date | null;
  tempoGasto: number | null;
  dataCriacao: Date;
  dataAtualizacao: Date | null;
}

export class AulaRepository {
  async create(data: NewAula): Promise<Aula> {
    const [aula] = await db
      .insert(aulas)
      .values({
        moduloId: data.moduloId,
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo,
        conteudo: data.conteudo,
        url: data.url,
        duracao: data.duracao,
        ordem: data.ordem ?? 0,
        obrigatoria: data.obrigatoria ?? true,
      })
      .returning();
    return aula;
  }

  async findAll(): Promise<Aula[]> {
    return await db.query.aulas.findMany({
      orderBy: [asc(aulas.ordem)],
    });
  }

  async findByModuloId(moduloId: number): Promise<Aula[]> {
    return await db.query.aulas.findMany({
      where: eq(aulas.moduloId, moduloId),
      orderBy: [asc(aulas.ordem)],
    });
  }

  async findById(id: number, options?: { includeRelations?: boolean }): Promise<Aula | undefined> {
    return await db.query.aulas.findFirst({
      where: eq(aulas.id, id),
      ...(options?.includeRelations && {
        with: {
          modulo: {
            with: {
              curso: true,
            },
          },
        },
      }),
    });
  }

  async findByIdWithProgresso(
    aulaId: number,
    utilizadorId: number
  ): Promise<(Aula & { progresso?: ProgressoAula }) | undefined> {
    const aula = await this.findById(aulaId);
    if (!aula) return undefined;

    const progresso = await this.findProgressoByAulaAndUtilizador(aulaId, utilizadorId);

    return {
      ...aula,
      ...(progresso && { progresso }),
    };
  }

  async update(id: number, data: UpdateAula): Promise<Aula | undefined> {
    const [updated] = await db
      .update(aulas)
      .set({
        ...data,
        dataAtualizacao: new Date(),
      })
      .where(eq(aulas.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(aulas).where(eq(aulas.id, id)).returning();
    return result.length > 0;
  }

  async countByModuloId(moduloId: number): Promise<number> {
    const result = await db.query.aulas.findMany({
      where: eq(aulas.moduloId, moduloId),
    });
    return result.length;
  }

  async reorder(moduloId: number, aulasOrdenadas: { id: number; ordem: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const { id, ordem } of aulasOrdenadas) {
        await tx
          .update(aulas)
          .set({ ordem, dataAtualizacao: new Date() })
          .where(and(eq(aulas.id, id), eq(aulas.moduloId, moduloId)));
      }
    });
  }

  // === MÉTODOS DE PROGRESSO ===

  async findProgressoByAulaAndUtilizador(
    aulaId: number,
    utilizadorId: number
  ): Promise<ProgressoAula | undefined> {
    return await db.query.progressoAulas.findFirst({
      where: and(eq(progressoAulas.aulaId, aulaId), eq(progressoAulas.utilizadorId, utilizadorId)),
    });
  }

  async findProgressoByUtilizador(utilizadorId: number): Promise<ProgressoAula[]> {
    return await db.query.progressoAulas.findMany({
      where: eq(progressoAulas.utilizadorId, utilizadorId),
    });
  }

  async marcarConcluida(
    aulaId: number,
    utilizadorId: number,
    tempoGasto?: number
  ): Promise<ProgressoAula> {
    const existente = await this.findProgressoByAulaAndUtilizador(aulaId, utilizadorId);

    if (existente) {
      const [updated] = await db
        .update(progressoAulas)
        .set({
          concluida: true,
          dataConclusao: new Date(),
          tempoGasto: tempoGasto ?? existente.tempoGasto,
          dataAtualizacao: new Date(),
        })
        .where(eq(progressoAulas.id, existente.id))
        .returning();
      return updated;
    } else {
      const [novo] = await db
        .insert(progressoAulas)
        .values({
          aulaId,
          utilizadorId,
          concluida: true,
          dataConclusao: new Date(),
          tempoGasto,
        })
        .returning();
      return novo;
    }
  }

  async desmarcarConcluida(aulaId: number, utilizadorId: number): Promise<ProgressoAula | undefined> {
    const existente = await this.findProgressoByAulaAndUtilizador(aulaId, utilizadorId);

    if (existente) {
      const [updated] = await db
        .update(progressoAulas)
        .set({
          concluida: false,
          dataConclusao: null,
          dataAtualizacao: new Date(),
        })
        .where(eq(progressoAulas.id, existente.id))
        .returning();
      return updated;
    }

    return undefined;
  }

  async calcularProgressoCurso(cursoId: number, utilizadorId: number): Promise<{
    totalAulas: number;
    aulasConcluidas: number;
    percentual: number;
  }> {
    // Buscar todos os módulos do curso com suas aulas
    const modulosDoCurso = await db.query.modulos.findMany({
      where: (modulos, { eq }) => eq(modulos.cursoId, cursoId),
      with: {
        aulas: true,
      },
    });

    const todasAulas = modulosDoCurso.flatMap((m) => m.aulas);
    const totalAulas = todasAulas.length;

    if (totalAulas === 0) {
      return { totalAulas: 0, aulasConcluidas: 0, percentual: 0 };
    }

    // Buscar progresso do utilizador
    const progressos = await db.query.progressoAulas.findMany({
      where: (progressoAulas, { eq, and, inArray }) =>
        and(
          eq(progressoAulas.utilizadorId, utilizadorId),
          eq(progressoAulas.concluida, true),
          inArray(
            progressoAulas.aulaId,
            todasAulas.map((a) => a.id)
          )
        ),
    });

    const aulasConcluidas = progressos.length;
    const percentual = Math.round((aulasConcluidas / totalAulas) * 100);

    return { totalAulas, aulasConcluidas, percentual };
  }
}

export const aulaRepository = new AulaRepository();
