import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { CategoriaBase } from '../types';

interface CreateCategoriaInput {
  nome: string;
  descricao?: string;
  IDArea: number;
}

interface UpdateCategoriaInput {
  nome?: string;
  descricao?: string;
  IDArea?: number;
}

class CategoriaService {
  /**
   * Lista todas as categorias
   */
  async getAll(): Promise<CategoriaBase[]> {
    try {
      return await apiService.get<CategoriaBase[]>('/categorias');
    } catch (error: unknown) {
      return handleApiError(error, 'listar categorias');
    }
  }

  /**
   * Lista categorias por área
   */
  async getByArea(areaId: number): Promise<CategoriaBase[]> {
    try {
      return await apiService.get<CategoriaBase[]>(`/categorias?IDArea=${areaId}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar categorias por área');
    }
  }

  /**
   * Busca uma categoria por ID
   */
  async getById(id: number): Promise<CategoriaBase> {
    try {
      return await apiService.get<CategoriaBase>(`/categorias/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'buscar categoria');
    }
  }

  /**
   * Cria uma nova categoria
   */
  async create(data: CreateCategoriaInput): Promise<CategoriaBase> {
    try {
      return await apiService.post<CategoriaBase>('/categorias', data);
    } catch (error: unknown) {
      return handleApiError(error, 'criar categoria');
    }
  }

  /**
   * Atualiza uma categoria
   */
  async update(id: number, data: UpdateCategoriaInput): Promise<CategoriaBase> {
    try {
      return await apiService.put<CategoriaBase>(`/categorias/${id}`, data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar categoria');
    }
  }

  /**
   * Remove uma categoria
   */
  async delete(id: number): Promise<void> {
    try {
      await apiService.delete(`/categorias/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'remover categoria');
    }
  }

  /**
   * Remove múltiplas categorias
   */
  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    try {
      return await apiService.post<{ deletedCount: number }>('/categorias/bulk-delete', { ids });
    } catch (error: unknown) {
      return handleApiError(error, 'remover categorias em massa');
    }
  }
}

export const categoriaService = new CategoriaService();
