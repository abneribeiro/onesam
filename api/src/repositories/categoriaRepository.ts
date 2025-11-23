import { eq, desc, count, sql, inArray } from 'drizzle-orm';
import { db } from '../database/db';
import { categorias } from '../database/schema';
import type { Categoria, NewCategoria } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';
import { executePaginatedQuery, buildOrderBy } from '../utils/pagination';

export class CategoriaRepository {
  async create(data: NewCategoria): Promise<Categoria> {
    const [categoria] = await db.insert(categorias).values(data).returning();
    return categoria;
  }

  async findAll(): Promise<Categoria[]> {
    return await db.query.categorias.findMany({
      with: {
        area: true,
      },
      orderBy: [desc(categorias.dataCriacao)],
    });
  }

  async findAllPaginated(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Categoria>> {
    const columnMap = {
      nome: categorias.nome,
      dataCriacao: categorias.dataCriacao,
      dataAtualizacao: categorias.dataAtualizacao,
    };

    const orderByClause = buildOrderBy(columnMap, sortParams) || sql`${categorias.dataCriacao} DESC`;

    const query = db
      .select()
      .from(categorias)
      .orderBy(orderByClause);

    const countQuery = db.select({ count: count() }).from(categorias);

    return executePaginatedQuery<Categoria>(query, countQuery, pagination);
  }

  async findById(id: number): Promise<Categoria | undefined> {
    return await db.query.categorias.findFirst({
      where: eq(categorias.id, id),
      with: {
        area: true,
        cursos: true,
      },
    });
  }

  async findByAreaId(areaId: number): Promise<Categoria[]> {
    return await db.query.categorias.findMany({
      where: eq(categorias.areaId, areaId),
      orderBy: [desc(categorias.dataCriacao)],
    });
  }

  async update(id: number, data: Partial<NewCategoria>): Promise<Categoria | undefined> {
    const [categoria] = await db
      .update(categorias)
      .set({ ...data, dataAtualizacao: new Date() })
      .where(eq(categorias.id, id))
      .returning();
    return categoria;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(categorias).where(eq(categorias.id, id)).returning();
    return result.length > 0;
  }

  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(categorias).where(inArray(categorias.id, ids)).returning();
    return result.length;
  }
}

export const categoriaRepository = new CategoriaRepository();
