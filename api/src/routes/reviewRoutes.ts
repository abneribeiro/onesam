import express, { type Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { validateDto, validateParams } from '../middlewares/validateDto';
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

// Apply authentication to all routes
router.use(betterAuthMiddleware);

router.get(
  '/curso/:cursoId',
  validateParams(listReviewsByCursoSchema.shape.params),
  reviewController.listarReviewsPorCurso
);

router.get(
  '/curso/:cursoId/stats',
  validateParams(getStatsSchema.shape.params),
  reviewController.obterEstatisticas
);

router.get(
  '/curso/:cursoId/minha',
  validateParams(getMyReviewSchema.shape.params),
  reviewController.obterMinhaReview
);

router.get(
  '/minhas',
  reviewController.listarMinhasReviews
);

router.get(
  '/:id',
  validateParams(getReviewSchema.shape.params),
  reviewController.obterReview
);

router.post(
  '/',
  validateDto(createReviewSchema.shape.body),
  reviewController.criarReview
);

router.put(
  '/:id',
  validateParams(updateReviewSchema.shape.params),
  validateDto(updateReviewSchema.shape.body),
  reviewController.atualizarReview
);

router.delete(
  '/:id',
  validateParams(deleteReviewSchema.shape.params),
  reviewController.deletarReview
);

export default router;
