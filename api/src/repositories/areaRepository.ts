import { eq, count, sql, inArray } from 'drizzle-orm';
import { db } from '../database/db';
import { areas } from '../database/schema';
import type { Area, NewArea } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';
import { executePaginatedQuery, buildOrderBy } from '../utils/pagination';

export class AreaRepository {
  async create(data: NewArea): Promise<Area> {
    const [area] = await db.insert(areas).values(data).returning();
    return area;
  }

  async findAll(): Promise<Area[]> {
    return await db.query.areas.findMany({
      with: {
        categorias: true,
      },
    });
  }

  async findAllPaginated(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Area>> {
    const columnMap = {
      nome: areas.nome,
      dataCriacao: areas.dataCriacao,
      dataAtualizacao: areas.dataAtualizacao,
    };

    const orderByClause = buildOrderBy(columnMap, sortParams) || sql`${areas.dataCriacao} DESC`;

    const query = db
      .select()
      .from(areas)
      .orderBy(orderByClause);

    const countQuery = db.select({ count: count() }).from(areas);

    return executePaginatedQuery<Area>(query, countQuery, pagination);
  }

  async findById(id: number): Promise<Area | undefined> {
    return await db.query.areas.findFirst({
      where: eq(areas.id, id),
      with: {
        categorias: true,
      },
    });
  }

  async update(id: number, data: Partial<NewArea>): Promise<Area | undefined> {
    const [area] = await db
      .update(areas)
      .set({ ...data, dataAtualizacao: new Date() })
      .where(eq(areas.id, id))
      .returning();
    return area;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(areas).where(eq(areas.id, id)).returning();
    return result.length > 0;
  }

  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(areas).where(inArray(areas.id, ids)).returning();
    return result.length;
  }
}

export const areaRepository = new AreaRepository();
