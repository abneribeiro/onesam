import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Utilizador } from '../types';
import type { PaginationParams, PaginatedResponse } from '../types/pagination';

class UtilizadorService {
  /**
   * Lista todos os utilizadores (admin/gestor)
   */
  async getAll(): Promise<Utilizador[]> {
    try {
      return await apiService.get<Utilizador[]>('/utilizadores');
    } catch (error: unknown) {
      return handleApiError(error, 'listar utilizadores');
    }
  }

  /**
   * Lista utilizadores com paginação (admin/gestor)
   */
  async getAllPaginated(
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Utilizador>> {
    try {
      const params = new URLSearchParams();

      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.limit) params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

      return await apiService.get<PaginatedResponse<Utilizador>>(`/utilizadores?${params.toString()}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar utilizadores paginados');
    }
  }

  /**
   * Busca um utilizador por ID (admin/gestor)
   */
  async getById(id: number): Promise<Utilizador> {
    try {
      return await apiService.get<Utilizador>(`/utilizadores/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'buscar utilizador');
    }
  }

  /**
   * Cria um novo utilizador (admin/gestor)
   */
  async create(data: Partial<Utilizador>): Promise<Utilizador> {
    try {
      return await apiService.post<Utilizador>('/utilizadores', data);
    } catch (error: unknown) {
      return handleApiError(error, 'criar utilizador');
    }
  }

  /**
   * Atualiza um utilizador (admin/gestor)
   */
  async update(id: number, data: Partial<Utilizador>): Promise<Utilizador> {
    try {
      return await apiService.put<Utilizador>(`/utilizadores/${id}`, data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar utilizador');
    }
  }

  /**
   * Deleta um utilizador (admin/gestor)
   */
  async delete(id: number): Promise<void> {
    try {
      await apiService.delete(`/utilizadores/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'deletar utilizador');
    }
  }

  /**
   * Busca perfil do utilizador autenticado
   */
  async meuPerfil(): Promise<Utilizador> {
    try {
      return await apiService.get<Utilizador>('/utilizadores/perfil');
    } catch (error: unknown) {
      return handleApiError(error, 'buscar perfil');
    }
  }

  /**
   * Atualiza perfil do utilizador autenticado
   */
  async atualizarPerfil(data: Partial<Utilizador>): Promise<Utilizador> {
    try {
      return await apiService.put<Utilizador>('/utilizadores/perfil', data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar perfil');
    }
  }

  /**
   * Faz upload do avatar do utilizador
   */
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      return await apiService.upload<{ avatarUrl: string }>(
        '/utilizadores/perfil/avatar',
        formData,
        (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      );
    } catch (error: unknown) {
      return handleApiError(error, 'fazer upload do avatar');
    }
  }

  /**
   * Altera a senha do utilizador autenticado
   */
  async alterarSenha(data: { senhaAtual: string; novaSenha: string }): Promise<void> {
    try {
      await apiService.post('/utilizadores/perfil/senha', data);
    } catch (error: unknown) {
      return handleApiError(error, 'alterar senha');
    }
  }

  /**
   * Desativa/Ativa um utilizador (gestor)
   */
  async toggleAtivo(id: number): Promise<Utilizador> {
    try {
      return await apiService.patch<Utilizador>(`/utilizadores/${id}/toggle-ativo`);
    } catch (error: unknown) {
      return handleApiError(error, 'alterar estado do utilizador');
    }
  }

  /**
   * Remove múltiplos utilizadores
   */
  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    try {
      return await apiService.post<{ deletedCount: number }>('/utilizadores/bulk-delete', { ids });
    } catch (error: unknown) {
      return handleApiError(error, 'remover utilizadores em massa');
    }
  }
}

export const utilizadorService = new UtilizadorService();
export default UtilizadorService;
