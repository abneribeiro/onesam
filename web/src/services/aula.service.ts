import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';

export type TipoConteudo = 'video' | 'documento' | 'link' | 'texto' | 'quiz';

export interface Aula {
  id: number;
  moduloId: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoConteudo;
  conteudo: string | null;
  url: string | null;
  duracao: number | null;
  ordem: number;
  obrigatoria: boolean;
  dataCriacao: string;
  dataAtualizacao: string | null;
  progresso?: ProgressoAula;
}

export interface ProgressoAula {
  id: number;
  aulaId: number;
  utilizadorId: number;
  concluida: boolean;
  dataConclusao: string | null;
  tempoGasto: number | null;
  dataCriacao: string;
  dataAtualizacao: string | null;
}

export interface ProgressoCurso {
  totalAulas: number;
  aulasConcluidas: number;
  percentual: number;
}

export interface AulaInput {
  titulo: string;
  descricao?: string;
  tipo: TipoConteudo;
  conteudo?: string;
  url?: string;
  duracao?: number;
  ordem?: number;
  obrigatoria?: boolean;
  IDModulo: number;
}

export interface AulaUpdate {
  titulo?: string;
  descricao?: string;
  tipo?: TipoConteudo;
  conteudo?: string;
  url?: string;
  duracao?: number;
  ordem?: number;
  obrigatoria?: boolean;
}

class AulaService {
  /**
   * Lista todas as aulas
   */
  async listarAulas(): Promise<Aula[]> {
    try {
      const { aulas } = await apiService.get<{ aulas: Aula[] }>('/aulas');
      return aulas;
    } catch (error: unknown) {
      return handleApiError(error, 'listar aulas');
    }
  }

  /**
   * Lista aulas de um módulo específico
   */
  async listarAulasPorModulo(moduloId: number): Promise<Aula[]> {
    try {
      const { aulas } = await apiService.get<{ aulas: Aula[] }>(`/aulas/modulo/${moduloId}`);
      return aulas;
    } catch (error: unknown) {
      return handleApiError(error, 'listar aulas do módulo');
    }
  }

  /**
   * Obtém uma aula específica
   */
  async obterAula(id: number): Promise<Aula> {
    try {
      const { aula } = await apiService.get<{ aula: Aula }>(`/aulas/${id}`);
      return aula;
    } catch (error: unknown) {
      return handleApiError(error, 'obter aula');
    }
  }

  /**
   * Cria uma nova aula
   */
  async criarAula(data: AulaInput): Promise<Aula> {
    try {
      const { aula } = await apiService.post<{ aula: Aula }>('/aulas', data);
      return aula;
    } catch (error: unknown) {
      return handleApiError(error, 'criar aula');
    }
  }

  /**
   * Atualiza uma aula
   */
  async atualizarAula(id: number, data: AulaUpdate): Promise<Aula> {
    try {
      const { aula } = await apiService.put<{ aula: Aula }>(`/aulas/${id}`, data);
      return aula;
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar aula');
    }
  }

  /**
   * Deleta uma aula
   */
  async deletarAula(id: number): Promise<void> {
    try {
      await apiService.delete(`/aulas/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'deletar aula');
    }
  }

  /**
   * Reordena aulas de um módulo
   */
  async reordenarAulas(moduloId: number, aulas: { id: number; ordem: number }[]): Promise<void> {
    try {
      await apiService.put(`/aulas/modulo/${moduloId}/reorder`, { aulas });
    } catch (error: unknown) {
      return handleApiError(error, 'reordenar aulas');
    }
  }

  // === MÉTODOS DE PROGRESSO ===

  /**
   * Marca uma aula como concluída
   */
  async marcarAulaConcluida(aulaId: number, tempoGasto?: number): Promise<ProgressoAula> {
    try {
      const { progresso } = await apiService.post<{ progresso: ProgressoAula }>(
        `/aulas/${aulaId}/concluir`,
        { tempoGasto }
      );
      return progresso;
    } catch (error: unknown) {
      return handleApiError(error, 'marcar aula como concluída');
    }
  }

  /**
   * Desmarca uma aula como concluída
   */
  async desmarcarAulaConcluida(aulaId: number): Promise<ProgressoAula> {
    try {
      const { progresso } = await apiService.delete<{ progresso: ProgressoAula }>(
        `/aulas/${aulaId}/concluir`
      );
      return progresso;
    } catch (error: unknown) {
      return handleApiError(error, 'desmarcar aula como concluída');
    }
  }

  /**
   * Obtém o progresso de um curso
   */
  async obterProgressoCurso(cursoId: number): Promise<ProgressoCurso> {
    try {
      const { progresso } = await apiService.get<{ progresso: ProgressoCurso }>(
        `/aulas/progresso/curso/${cursoId}`
      );
      return progresso;
    } catch (error: unknown) {
      return handleApiError(error, 'obter progresso do curso');
    }
  }

  /**
   * Obtém todo o progresso do utilizador
   */
  async obterMeuProgresso(): Promise<ProgressoAula[]> {
    try {
      const { progressos } = await apiService.get<{ progressos: ProgressoAula[] }>(
        '/aulas/progresso/meu'
      );
      return progressos;
    } catch (error: unknown) {
      return handleApiError(error, 'obter meu progresso');
    }
  }

  // === MÉTODOS DE UPLOAD ===

  /**
   * Faz upload de um vídeo para uma aula
   */
  async uploadVideo(
    file: File,
    cursoId: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('cursoId', cursoId.toString());

      const { url } = await apiService.postFormData<{ url: string }>(
        '/aulas/upload-video',
        formData,
        onProgress ? (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        } : undefined
      );
      return url;
    } catch (error: unknown) {
      return handleApiError(error, 'fazer upload do vídeo');
    }
  }
}

export const aulaService = new AulaService();
