import { categoriaRepository } from '../repositories/categoriaRepository';
import type { Categoria } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';

export class CategoriaService {
  async listarCategoriasPaginadas(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Categoria>> {
    return categoriaRepository.findAllPaginated(pagination, sortParams);
  }
}

export const categoriaService = new CategoriaService();
