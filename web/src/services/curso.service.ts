import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Curso, CursoComRelations, CursoInput, CursoFiltros } from '../types';
import type { PaginationParams, PaginatedResponse } from '../types/pagination';

class CursoService {
  /**
   * Lista todos os cursos
   */
  async listarCursos(filtros?: CursoFiltros): Promise<CursoComRelations[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.nivel) params.append('nivel', filtros.nivel);
      if (filtros?.categoriaId) params.append('categoriaId', filtros.categoriaId.toString());
      if (filtros?.areaId) params.append('areaId', filtros.areaId.toString());

      return await apiService.get<CursoComRelations[]>(`/cursos?${params.toString()}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar cursos');
    }
  }

  /**
   * Lista cursos com paginação
   */
  async listarCursosPaginados(
    pagination: PaginationParams,
    filtros?: CursoFiltros
  ): Promise<PaginatedResponse<CursoComRelations>> {
    try {
      const params = new URLSearchParams();

      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.limit) params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

      if (filtros?.search) params.append('search', filtros.search);
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.nivel) params.append('nivel', filtros.nivel);
      if (filtros?.categoriaId) params.append('categoriaId', filtros.categoriaId.toString());
      if (filtros?.areaId) params.append('areaId', filtros.areaId.toString());

      return await apiService.get<PaginatedResponse<CursoComRelations>>(`/cursos?${params.toString()}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar cursos paginados');
    }
  }

  /**
   * Busca um curso por ID
   */
  async buscarCurso(id: number): Promise<CursoComRelations> {
    try {
      return await apiService.get<CursoComRelations>(`/cursos/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'buscar curso');
    }
  }

  /**
   * Cria um novo curso
   */
  async criarCurso(data: CursoInput): Promise<Curso> {
    try {
      return await apiService.post<Curso>('/cursos', data);
    } catch (error: unknown) {
      return handleApiError(error, 'criar curso');
    }
  }

  /**
   * Cria um novo curso com imagem
   */
  async criarCursoComImagem(data: CursoInput, imagemCurso?: File): Promise<Curso> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (imagemCurso) {
        formData.append('imagemCurso', imagemCurso);
      }

      return await apiService.postFormData<Curso>('/cursos', formData);
    } catch (error: unknown) {
      return handleApiError(error, 'criar curso');
    }
  }

  /**
   * Atualiza um curso existente
   */
  async atualizarCurso(id: number, data: Partial<CursoInput>): Promise<Curso> {
    try {
      return await apiService.put<Curso>(`/cursos/${id}`, data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar curso');
    }
  }

  /**
   * Atualiza um curso existente com imagem
   */
  async atualizarCursoComImagem(id: number, data: Partial<CursoInput>, imagemCurso?: File): Promise<Curso> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (imagemCurso) {
        formData.append('imagemCurso', imagemCurso);
      }

      return await apiService.putFormData<Curso>(`/cursos/${id}`, formData);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar curso');
    }
  }

  /**
   * Remove um curso
   */
  async removerCurso(id: number): Promise<void> {
    try {
      await apiService.delete(`/cursos/${id}`);
    } catch (error: unknown) {
      handleApiError(error, 'remover curso');
    }
  }

  /**
   * Remove múltiplos cursos
   */
  async removerCursosEmMassa(ids: number[]): Promise<{ deletedCount: number }> {
    try {
      return await apiService.post<{ deletedCount: number }>('/cursos/bulk-delete', { ids });
    } catch (error: unknown) {
      return handleApiError(error, 'remover cursos em massa');
    }
  }
}

export const cursoService = new CursoService();
export default CursoService;
