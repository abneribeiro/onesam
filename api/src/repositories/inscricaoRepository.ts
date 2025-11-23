import { eq, desc, and, count, asc, SQL, ilike, or, inArray } from 'drizzle-orm';
import { db } from '../database/db';
import { inscricoes, utilizadores, cursos } from '../database/schema';
import type { Inscricao, NewInscricao, EstadoInscricao } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';
import { sanitizeSearchTerm } from '../utils/validationHelper';

export interface InscricaoFiltros {
  search?: string;
  estado?: EstadoInscricao;
}

// Tipos para as colunas de ordenação
type SortableColumn = typeof inscricoes.dataInscricao | typeof inscricoes.estado | typeof inscricoes.dataAtualizacao;

export class InscricaoRepository {
  async create(data: NewInscricao): Promise<Inscricao> {
    const [inscricao] = await db.insert(inscricoes).values(data).returning();
    return inscricao;
  }

  async findAll(): Promise<Inscricao[]> {
    return await db.query.inscricoes.findMany({
      with: {
        curso: {
          with: {
            area: true,
            categoria: true,
          },
        },
        utilizador: true,
      },
      orderBy: [desc(inscricoes.dataInscricao)],
    });
  }

  /**
   * Busca paginada com filtros aplicados no SQL
   * CORREÇÃO: O filtro de busca agora é aplicado no SQL, não em memória
   */
  async findAllPaginated(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' },
    filtros?: InscricaoFiltros
  ): Promise<PaginatedResult<Inscricao>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    const sortBy = sortParams?.sortBy || 'dataInscricao';
    const sortOrder = sortParams?.sortOrder || 'desc';

    // Column map com tipagem correta (sem any)
    const columnMap: Record<string, SortableColumn> = {
      dataInscricao: inscricoes.dataInscricao,
      estado: inscricoes.estado,
      dataAtualizacao: inscricoes.dataAtualizacao,
    };

    const sortColumn = columnMap[sortBy] || inscricoes.dataInscricao;
    const orderByClause = sortOrder === 'desc' ? [desc(sortColumn)] : [asc(sortColumn)];

    // Build where conditions
    const conditions: SQL[] = [];
    if (filtros?.estado) {
      conditions.push(eq(inscricoes.estado, filtros.estado));
    }

    // CORREÇÃO: Se há busca, primeiro encontrar os IDs correspondentes via SQL
    let matchingIds: number[] | null = null;

    if (filtros?.search) {
      const sanitizedSearch = sanitizeSearchTerm(filtros.search);
      const searchPattern = `%${sanitizedSearch}%`;

      // Buscar IDs de inscrições que correspondem ao filtro via JOIN
      const searchResults = await db
        .select({ id: inscricoes.id })
        .from(inscricoes)
        .leftJoin(utilizadores, eq(inscricoes.utilizadorId, utilizadores.id))
        .leftJoin(cursos, eq(inscricoes.cursoId, cursos.id))
        .where(
          or(
            ilike(utilizadores.nome, searchPattern),
            ilike(utilizadores.email, searchPattern),
            ilike(cursos.nome, searchPattern)
          )
        );

      matchingIds = searchResults.map(r => r.id);

      // Se não houver resultados, retornar vazio imediatamente
      if (matchingIds.length === 0) {
        return {
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      // Adicionar condição de IDs correspondentes
      conditions.push(inArray(inscricoes.id, matchingIds));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count com filtros
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(inscricoes)
      .where(whereClause);

    // Get paginated data with relations
    const data = await db.query.inscricoes.findMany({
      with: {
        curso: {
          with: {
            area: true,
            categoria: true,
          },
        },
        utilizador: true,
      },
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: number): Promise<Inscricao | undefined> {
    return await db.query.inscricoes.findFirst({
      where: eq(inscricoes.id, id),
      with: {
        curso: {
          with: {
            area: true,
            categoria: true,
          },
        },
        utilizador: true,
      },
    });
  }

  async findByCursoId(cursoId: number): Promise<Inscricao[]> {
    return await db.query.inscricoes.findMany({
      where: eq(inscricoes.cursoId, cursoId),
      with: {
        utilizador: true,
      },
      orderBy: [desc(inscricoes.dataInscricao)],
    });
  }

  async findByUtilizadorId(utilizadorId: number): Promise<Inscricao[]> {
    return await db.query.inscricoes.findMany({
      where: eq(inscricoes.utilizadorId, utilizadorId),
      with: {
        curso: {
          with: {
            area: true,
            categoria: true,
          },
        },
      },
      orderBy: [desc(inscricoes.dataInscricao)],
    });
  }

  async findByUtilizadorAndCurso(utilizadorId: number, cursoId: number): Promise<Inscricao | undefined> {
    return await db.query.inscricoes.findFirst({
      where: and(
        eq(inscricoes.utilizadorId, utilizadorId),
        eq(inscricoes.cursoId, cursoId)
      ),
      with: {
        curso: true,
        utilizador: true,
      },
    });
  }

  async findByEstado(estado: EstadoInscricao): Promise<Inscricao[]> {
    return await db.query.inscricoes.findMany({
      where: eq(inscricoes.estado, estado),
      with: {
        curso: {
          with: {
            area: true,
            categoria: true,
          },
        },
        utilizador: true,
      },
      orderBy: [desc(inscricoes.dataInscricao)],
    });
  }

  async updateEstado(id: number, estado: EstadoInscricao): Promise<Inscricao | undefined> {
    const [inscricao] = await db
      .update(inscricoes)
      .set({ estado, dataAtualizacao: new Date() })
      .where(eq(inscricoes.id, id))
      .returning();
    return inscricao;
  }

  async update(id: number, data: Partial<NewInscricao>): Promise<Inscricao | undefined> {
    const [inscricao] = await db
      .update(inscricoes)
      .set({ ...data, dataAtualizacao: new Date() })
      .where(eq(inscricoes.id, id))
      .returning();
    return inscricao;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(inscricoes).where(eq(inscricoes.id, id)).returning();
    return result.length > 0;
  }
}

export const inscricaoRepository = new InscricaoRepository();
