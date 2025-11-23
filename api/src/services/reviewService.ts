import { reviewRepository, type NewReview, type UpdateReview, type Review, type ReviewStats } from '../repositories/reviewRepository';
import { cursoRepository } from '../repositories/cursoRepository';
import { inscricaoRepository } from '../repositories/inscricaoRepository';
import { CustomError } from '../utils/errorHandler';

export class ReviewService {
  async create(data: NewReview): Promise<Review> {
    const curso = await cursoRepository.findById(data.cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    const inscricao = await inscricaoRepository.findByUtilizadorAndCurso(data.utilizadorId, data.cursoId);
    if (!inscricao || inscricao.estado !== 'aceite') {
      throw new CustomError('Você precisa estar inscrito e aceito no curso para fazer uma avaliação', 403);
    }

    const existingReview = await reviewRepository.findByCursoAndUtilizador(data.cursoId, data.utilizadorId);
    if (existingReview) {
      throw new CustomError('Você já fez uma avaliação deste curso', 400);
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new CustomError('A classificação deve ser entre 1 e 5 estrelas', 400);
    }

    return await reviewRepository.create(data);
  }

  async findByCursoId(cursoId: number): Promise<Review[]> {
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    return await reviewRepository.findByCursoId(cursoId);
  }

  async findByUtilizadorId(utilizadorId: number): Promise<Review[]> {
    return await reviewRepository.findByUtilizadorId(utilizadorId);
  }

  async findById(id: number): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new CustomError('Avaliação não encontrada', 404);
    }
    return review;
  }

  async update(id: number, utilizadorId: number, data: UpdateReview): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new CustomError('Avaliação não encontrada', 404);
    }

    if (review.utilizadorId !== utilizadorId) {
      throw new CustomError('Você não tem permissão para editar esta avaliação', 403);
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new CustomError('A classificação deve ser entre 1 e 5 estrelas', 400);
    }

    const updated = await reviewRepository.update(id, data);
    if (!updated) {
      throw new CustomError('Erro ao atualizar avaliação', 500);
    }

    return updated;
  }

  async delete(id: number, utilizadorId: number, isAdmin: boolean = false): Promise<void> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new CustomError('Avaliação não encontrada', 404);
    }

    if (!isAdmin && review.utilizadorId !== utilizadorId) {
      throw new CustomError('Você não tem permissão para deletar esta avaliação', 403);
    }

    const deleted = await reviewRepository.delete(id);
    if (!deleted) {
      throw new CustomError('Erro ao deletar avaliação', 500);
    }
  }

  async getStatsByCursoId(cursoId: number): Promise<ReviewStats> {
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    return await reviewRepository.getStatsByCursoId(cursoId);
  }

  async getMyReview(utilizadorId: number, cursoId: number): Promise<Review | null> {
    const review = await reviewRepository.findByCursoAndUtilizador(cursoId, utilizadorId);
    return review || null;
  }
}

export const reviewService = new ReviewService();
