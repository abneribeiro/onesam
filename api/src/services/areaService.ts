import { areaRepository } from '../repositories/areaRepository';
import type { Area } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';

export class AreaService {
  async listarAreasPaginadas(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Area>> {
    return areaRepository.findAllPaginated(pagination, sortParams);
  }
}

export const areaService = new AreaService();
