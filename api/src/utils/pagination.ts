import { SQL, sql } from 'drizzle-orm';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function normalizePaginationParams(params?: PaginationParams) {
  const page = Math.max(1, params?.page || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function withPagination<T extends { limit: (limit: number) => any; offset: (offset: number) => any }>(
  qb: T,
  params?: PaginationParams
) {
  const { limit, offset } = normalizePaginationParams(params);
  return qb.limit(limit).offset(offset);
}

export function calculatePaginationMeta(
  total: number,
  params?: PaginationParams
): PaginationMeta {
  const { page, limit } = normalizePaginationParams(params);
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function executePaginatedQuery<T>(
  queryBuilder: any,
  countQuery: Promise<{ count: number }[]>,
  params?: PaginationParams
): Promise<PaginatedResult<T>> {
  const dynamicQuery = queryBuilder.$dynamic();
  const paginatedQuery = withPagination(dynamicQuery, params);

  const [data, countResult] = await Promise.all([
    paginatedQuery,
    countQuery,
  ]);

  const total = countResult[0]?.count || 0;
  const meta = calculatePaginationMeta(total, params);

  return {
    data: data as T[],
    meta,
  };
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function buildOrderBy(
  columnMap: Record<string, any>,
  params?: SortParams
): SQL | undefined {
  if (!params?.sortBy || !columnMap[params.sortBy]) {
    return undefined;
  }

  const column = columnMap[params.sortBy];
  const order = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return order === 'desc' ? sql`${column} DESC` : sql`${column} ASC`;
}
