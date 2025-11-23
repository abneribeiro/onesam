import { eq, desc, count, and, ilike, sql, inArray } from 'drizzle-orm';
import { db } from '../database/db';
import { cursos } from '../database/schema';
import type { Curso, NewCurso, EstadoCurso } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';
import { executePaginatedQuery, buildOrderBy } from '../utils/pagination';
import { sanitizeSearchTerm } from '../utils/validationHelper';

export interface CursoFiltros {
  search?: string;
  areaId?: number;
  categoriaId?: number;
  estado?: EstadoCurso;
  nivel?: 'iniciante' | 'intermedio' | 'avancado';
  visivel?: boolean;
}

export class CursoRepository {
  async create(data: NewCurso): Promise<Curso> {
    const [curso] = await db.insert(cursos).values(data).returning();
    return curso;
  }

  async findAll(options?: { includeRelations?: boolean }): Promise<Curso[]> {
    return await db.query.cursos.findMany({
      ...(options?.includeRelations && {
        with: {
          area: true,
          categoria: true,
        }
      }),
      orderBy: [desc(cursos.dataCriacao)],
    });
  }

  async findAllPaginated(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' },
    filtros?: CursoFiltros
  ): Promise<PaginatedResult<Curso>> {
    const columnMap = {
      nome: cursos.nome,
      dataInicio: cursos.dataInicio,
      dataFim: cursos.dataFim,
      estado: cursos.estado,
      dataCriacao: cursos.dataCriacao,
    };

    const orderByClause = buildOrderBy(columnMap, sortParams) || sql`${cursos.dataCriacao} DESC`;

    const whereConditions = [];

    // SECURITY: Sanitizar input para prevenir SQL injection via caracteres especiais do LIKE
    if (filtros?.search) {
      const sanitizedSearch = sanitizeSearchTerm(filtros.search);
      whereConditions.push(ilike(cursos.nome, `%${sanitizedSearch}%`));
    }

    if (filtros?.areaId) {
      whereConditions.push(eq(cursos.areaId, filtros.areaId));
    }

    if (filtros?.categoriaId) {
      whereConditions.push(eq(cursos.categoriaId, filtros.categoriaId));
    }

    if (filtros?.estado) {
      whereConditions.push(eq(cursos.estado, filtros.estado));
    }

    if (filtros?.nivel) {
      whereConditions.push(eq(cursos.nivel, filtros.nivel));
    }

    if (filtros?.visivel !== undefined) {
      whereConditions.push(eq(cursos.visivel, filtros.visivel));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const query = db
      .select()
      .from(cursos)
      .where(whereClause)
      .orderBy(orderByClause);

    const countQuery = db
      .select({ count: count() })
      .from(cursos)
      .where(whereClause);

    return executePaginatedQuery<Curso>(query, countQuery, pagination);
  }

  async findById(id: number, options?: { includeRelations?: boolean }): Promise<Curso | undefined> {
    return await db.query.cursos.findFirst({
      where: eq(cursos.id, id),
      ...(options?.includeRelations && {
        with: {
          area: true,
          categoria: true,
          modulos: {
            with: {
              aulas: {
                orderBy: (aulas, { asc }) => [asc(aulas.ordem)]
              }
            },
            orderBy: (modulos, { asc }) => [asc(modulos.ordem)]
          }
        }
      }),
    });
  }

  async update(id: number, data: Partial<NewCurso>): Promise<Curso | undefined> {
    const [curso] = await db
      .update(cursos)
      .set({ ...data, dataAtualizacao: new Date() })
      .where(eq(cursos.id, id))
      .returning();
    return curso;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(cursos).where(eq(cursos.id, id)).returning();
    return result.length > 0;
  }

  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(cursos).where(inArray(cursos.id, ids)).returning();
    return result.length;
  }
}

export const cursoRepository = new CursoRepository();
