import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { AreaBase } from '../types';

interface CreateAreaInput {
  nome: string;
  descricao?: string;
}

interface UpdateAreaInput {
  nome?: string;
  descricao?: string;
}

class AreaService {
  async getAll(): Promise<AreaBase[]> {
    try {
      return await apiService.get<AreaBase[]>('/areas');
    } catch (error: unknown) {
      return handleApiError(error, 'listar áreas');
    }
  }

  async getById(id: number): Promise<AreaBase> {
    try {
      return await apiService.get<AreaBase>(`/areas/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'buscar área');
    }
  }

  async create(data: CreateAreaInput): Promise<AreaBase> {
    try {
      return await apiService.post<AreaBase>('/areas', data);
    } catch (error: unknown) {
      return handleApiError(error, 'criar área');
    }
  }

  async update(id: number, data: UpdateAreaInput): Promise<AreaBase> {
    try {
      return await apiService.put<AreaBase>(`/areas/${id}`, data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar área');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiService.delete(`/areas/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'remover área');
    }
  }

  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    try {
      return await apiService.post<{ deletedCount: number }>('/areas/bulk-delete', { ids });
    } catch (error: unknown) {
      return handleApiError(error, 'remover áreas em massa');
    }
  }
}

export const areaService = new AreaService();
