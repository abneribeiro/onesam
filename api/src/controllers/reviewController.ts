import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { reviewService } from '../services/reviewService';
import { sendData, sendCreated, sendSuccess } from '../utils/responseHelper';

export const criarReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId, ...resto } = req.body;
    const review = await reviewService.create({
      cursoId,
      utilizadorId: req.utilizador!.id,
      ...resto
    });
    sendCreated(res, 'Avaliação criada com sucesso', { review });
  } catch (error) {
    next(error);
  }
};

export const listarReviewsPorCurso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const reviews = await reviewService.findByCursoId(Number(cursoId));
    sendData(res, { reviews });
  } catch (error) {
    next(error);
  }
};

export const listarMinhasReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewService.findByUtilizadorId(req.utilizador!.id);
    sendData(res, { reviews });
  } catch (error) {
    next(error);
  }
};

export const obterReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await reviewService.findById(Number(id));
    sendData(res, { review });
  } catch (error) {
    next(error);
  }
};

export const obterMinhaReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const review = await reviewService.getMyReview(req.utilizador!.id, Number(cursoId));
    sendData(res, { review });
  } catch (error) {
    next(error);
  }
};

export const atualizarReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await reviewService.update(Number(id), req.utilizador!.id, req.body);
    sendSuccess(res, 200, 'Avaliação atualizada com sucesso', { review });
  } catch (error) {
    next(error);
  }
};

export const deletarReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isAdmin = req.utilizador?.tipoPerfil === 'admin';
    await reviewService.delete(Number(id), req.utilizador!.id, isAdmin);
    sendSuccess(res, 200, 'Avaliação deletada com sucesso');
  } catch (error) {
    next(error);
  }
};

export const obterEstatisticas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const stats = await reviewService.getStatsByCursoId(Number(cursoId));
    sendData(res, { stats });
  } catch (error) {
    next(error);
  }
};
