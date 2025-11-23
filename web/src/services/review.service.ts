import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';

export interface Review {
  id: number;
  cursoId: number;
  utilizadorId: number;
  rating: number;
  comentario: string | null;
  dataCriacao: string;
  dataAtualizacao: string | null;
  utilizador?: {
    nome: string;
    avatar: string | null;
  };
}

export interface ReviewStats {
  totalReviews: number;
  mediaRating: number;
  distribuicao: {
    estrela1: number;
    estrela2: number;
    estrela3: number;
    estrela4: number;
    estrela5: number;
  };
}

export interface ReviewInput {
  IDCurso: number;
  rating: number;
  comentario?: string;
}

export interface ReviewUpdate {
  rating?: number;
  comentario?: string;
}

class ReviewService {
  async listarPorCurso(cursoId: number): Promise<Review[]> {
    try {
      const { reviews } = await apiService.get<{ reviews: Review[] }>(`/reviews/curso/${cursoId}`);
      return reviews;
    } catch (error: unknown) {
      return handleApiError(error, 'listar avaliações');
    }
  }

  async obterEstatisticas(cursoId: number): Promise<ReviewStats> {
    try {
      const { stats } = await apiService.get<{ stats: ReviewStats }>(`/reviews/curso/${cursoId}/stats`);
      return stats;
    } catch (error: unknown) {
      return handleApiError(error, 'obter estatísticas');
    }
  }

  async obterMinhaReview(cursoId: number): Promise<Review | null> {
    try {
      const { review } = await apiService.get<{ review: Review | null }>(`/reviews/curso/${cursoId}/minha`);
      return review;
    } catch (error: unknown) {
      // Se for erro 404 ou não encontrado, retorna null ao invés de lançar erro
      const errorWithResponse = error as { response?: { status?: number } };
      if (errorWithResponse?.response?.status === 404) {
        return null;
      }
      return handleApiError(error, 'obter minha avaliação');
    }
  }

  async criar(data: ReviewInput): Promise<Review> {
    try {
      const { review } = await apiService.post<{ review: Review }>('/reviews', data);
      return review;
    } catch (error: unknown) {
      return handleApiError(error, 'criar avaliação');
    }
  }

  async atualizar(id: number, data: ReviewUpdate): Promise<Review> {
    try {
      const { review } = await apiService.put<{ review: Review }>(`/reviews/${id}`, data);
      return review;
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar avaliação');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await apiService.delete(`/reviews/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'deletar avaliação');
    }
  }
}

export const reviewService = new ReviewService();
