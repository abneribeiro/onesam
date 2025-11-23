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
  '/curso/:IDCurso',
  betterAuthMiddleware,
  validateDto(listReviewsByCursoSchema),
  reviewController.listarReviewsPorCurso
);

router.get(
  '/curso/:IDCurso/stats',
  betterAuthMiddleware,
  validateDto(getStatsSchema),
  reviewController.obterEstatisticas
);

router.get(
  '/curso/:IDCurso/minha',
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
  '/:IDReview',
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
  '/:IDReview',
  betterAuthMiddleware,
  validateDto(updateReviewSchema),
  reviewController.atualizarReview
);

router.delete(
  '/:IDReview',
  betterAuthMiddleware,
  validateDto(deleteReviewSchema),
  reviewController.deletarReview
);

export default router;
