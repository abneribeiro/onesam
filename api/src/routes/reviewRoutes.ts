import express, { type Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { validateDto } from '../middlewares/validateDto';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewSchema,
  deleteReviewSchema,
  listReviewsByCursoSchema,
  getMyReviewSchema,
  getStatsSchema,
} from '../schemas/reviewSchemas';

const router: Router = express.Router();

router.get(
  '/curso/:cursoId',
  betterAuthMiddleware,
  validateDto(listReviewsByCursoSchema),
  reviewController.listarReviewsPorCurso
);

router.get(
  '/curso/:cursoId/stats',
  betterAuthMiddleware,
  validateDto(getStatsSchema),
  reviewController.obterEstatisticas
);

router.get(
  '/curso/:cursoId/minha',
  betterAuthMiddleware,
  validateDto(getMyReviewSchema),
  reviewController.obterMinhaReview
);

router.get(
  '/minhas',
  betterAuthMiddleware,
  reviewController.listarMinhasReviews
);

router.get(
  '/:id',
  betterAuthMiddleware,
  validateDto(getReviewSchema),
  reviewController.obterReview
);

router.post(
  '/',
  betterAuthMiddleware,
  validateDto(createReviewSchema.shape.body),
  reviewController.criarReview
);

router.put(
  '/:id',
  betterAuthMiddleware,
  validateDto(updateReviewSchema),
  reviewController.atualizarReview
);

router.delete(
  '/:id',
  betterAuthMiddleware,
  validateDto(deleteReviewSchema),
  reviewController.deletarReview
);

export default router;
