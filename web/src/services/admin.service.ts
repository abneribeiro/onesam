import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';

export interface AdminStats {
  totalCursos: number;
  totalUtilizadores: number;
  totalInscricoes: number;
  inscricoesPendentes: number;
  inscricoesAceites: number;
}

export interface CursoPopular {
  id: number;
  nome: string;
  nivel: string;
  numInscricoes: number;
}

class AdminService {
  async obterEstatisticas(): Promise<AdminStats> {
    try {
      const stats = await apiService.get<AdminStats>('/admin/stats');
      return stats;
    } catch (error: unknown) {
      return handleApiError(error, 'obter estatísticas');
    }
  }

  async obterCursosMaisPopulares(limit: number = 5): Promise<CursoPopular[]> {
    try {
      const cursos = await apiService.get<CursoPopular[]>(`/admin/cursos-populares?limit=${limit}`);
      return cursos;
    } catch (error: unknown) {
      return handleApiError(error, 'obter cursos populares');
    }
  }
}

export const adminService = new AdminService();
