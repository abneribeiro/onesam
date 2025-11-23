import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Inscricao, InscricaoComRelations, InscricaoInput, EstadoInscricao } from '../types';
import type { PaginationParams, PaginatedResponse } from '../types/pagination';

export interface InscricaoFiltros {
  search?: string;
  estado?: EstadoInscricao;
}

class InscricaoService {
  async minhasInscricoes(): Promise<InscricaoComRelations[]> {
    try {
      const inscricoes = await apiService.get<InscricaoComRelations[]>('/inscricoes/minhas');
      return inscricoes;
    } catch (error: unknown) {
      return handleApiError(error, 'listar inscrições');
    }
  }

  async inscritosCurso(cursoId: number): Promise<InscricaoComRelations[]> {
    try {
      const inscricoes = await apiService.get<InscricaoComRelations[]>(`/inscricoes/curso/${cursoId}`);
      return inscricoes;
    } catch (error: unknown) {
      return handleApiError(error, 'listar inscritos');
    }
  }

  async inscreverCurso(data: InscricaoInput): Promise<Inscricao> {
    try {
      const inscricao = await apiService.post<Inscricao>('/inscricoes', data);
      return inscricao;
    } catch (error: unknown) {
      return handleApiError(error, 'inscrever no curso');
    }
  }

  async aprovarInscricao(id: number): Promise<Inscricao> {
    try {
      const inscricao = await apiService.put<Inscricao>(`/inscricoes/${id}/aprovar`);
      return inscricao;
    } catch (error: unknown) {
      return handleApiError(error, 'aprovar inscrição');
    }
  }

  async rejeitarInscricao(id: number, motivo?: string): Promise<Inscricao> {
    try {
      const inscricao = await apiService.put<Inscricao>(`/inscricoes/${id}/rejeitar`, { motivo });
      return inscricao;
    } catch (error: unknown) {
      return handleApiError(error, 'rejeitar inscrição');
    }
  }

  async cancelarInscricao(id: number): Promise<void> {
    try {
      await apiService.put(`/inscricoes/${id}/cancelar`);
    } catch (error: unknown) {
      return handleApiError(error, 'cancelar inscrição');
    }
  }

  async listarTodasInscricoes(): Promise<InscricaoComRelations[]> {
    try {
      const inscricoes = await apiService.get<InscricaoComRelations[]>('/inscricoes');
      return inscricoes;
    } catch (error: unknown) {
      return handleApiError(error, 'listar todas as inscrições');
    }
  }

  async listarTodasInscricoesPaginadas(
    pagination: PaginationParams,
    filtros?: InscricaoFiltros
  ): Promise<PaginatedResponse<InscricaoComRelations>> {
    try {
      const params = new URLSearchParams();

      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.limit) params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
      if (filtros?.search) params.append('search', filtros.search);
      if (filtros?.estado) params.append('estado', filtros.estado);

      return await apiService.get<PaginatedResponse<InscricaoComRelations>>(`/inscricoes?${params.toString()}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar todas as inscrições paginadas');
    }
  }
}

export const inscricaoService = new InscricaoService();
export default InscricaoService;
