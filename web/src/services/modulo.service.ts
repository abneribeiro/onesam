import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Aula } from './aula.service';

export interface Modulo {
  id: number;
  cursoId: number;
  titulo: string;
  descricao: string | null;
  ordem: number;
  dataCriacao: string;
  dataAtualizacao: string | null;
  aulas?: Aula[];
}

export interface ModuloInput {
  titulo: string;
  descricao?: string;
  ordem?: number;
  IDCurso: number;
}

export interface ModuloUpdate {
  titulo?: string;
  descricao?: string;
  ordem?: number;
}

class ModuloService {
  /**
   * Lista todos os módulos
   */
  async listarModulos(): Promise<Modulo[]> {
    try {
      const { modulos } = await apiService.get<{ modulos: Modulo[] }>('/modulos');
      return modulos;
    } catch (error: unknown) {
      return handleApiError(error, 'listar módulos');
    }
  }

  /**
   * Lista módulos de um curso específico
   */
  async listarModulosPorCurso(cursoId: number, includeAulas: boolean = false): Promise<Modulo[]> {
    try {
      const params = includeAulas ? '?includeAulas=true' : '';
      const response = await apiService.get<{ modulos: Modulo[] } | Modulo[]>(
        `/modulos/curso/${cursoId}${params}`
      );
      // Handle both response formats: { modulos: [...] } or [...]
      if (Array.isArray(response)) {
        return response;
      }
      return response.modulos || [];
    } catch (error: unknown) {
      return handleApiError(error, 'listar módulos do curso');
    }
  }

  /**
   * Obtém um módulo específico
   */
  async obterModulo(id: number, includeAulas: boolean = false): Promise<Modulo> {
    try {
      const params = includeAulas ? '?includeAulas=true' : '';
      const { modulo } = await apiService.get<{ modulo: Modulo }>(`/modulos/${id}${params}`);
      return modulo;
    } catch (error: unknown) {
      return handleApiError(error, 'obter módulo');
    }
  }

  /**
   * Cria um novo módulo
   */
  async criarModulo(data: ModuloInput): Promise<Modulo> {
    try {
      const { modulo } = await apiService.post<{ modulo: Modulo }>('/modulos', data);
      return modulo;
    } catch (error: unknown) {
      return handleApiError(error, 'criar módulo');
    }
  }

  /**
   * Atualiza um módulo
   */
  async atualizarModulo(id: number, data: ModuloUpdate): Promise<Modulo> {
    try {
      const { modulo } = await apiService.put<{ modulo: Modulo }>(`/modulos/${id}`, data);
      return modulo;
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar módulo');
    }
  }

  /**
   * Deleta um módulo
   */
  async deletarModulo(id: number): Promise<void> {
    try {
      await apiService.delete(`/modulos/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'deletar módulo');
    }
  }

  /**
   * Reordena módulos de um curso
   */
  async reordenarModulos(cursoId: number, modulos: { id: number; ordem: number }[]): Promise<void> {
    try {
      await apiService.put(`/modulos/curso/${cursoId}/reorder`, { modulos });
    } catch (error: unknown) {
      return handleApiError(error, 'reordenar módulos');
    }
  }
}

export const moduloService = new ModuloService();
