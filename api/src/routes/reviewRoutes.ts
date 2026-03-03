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

// Apply authentication to all routes
router.use(betterAuthMiddleware);

router.get(
  '/curso/:cursoId',
  validateDto(listReviewsByCursoSchema),
  reviewController.listarReviewsPorCurso
);

router.get(
  '/curso/:cursoId/stats',
  validateDto(getStatsSchema),
  reviewController.obterEstatisticas
);

router.get(
  '/curso/:cursoId/minha',
  validateDto(getMyReviewSchema),
  reviewController.obterMinhaReview
);

router.get(
  '/minhas',
  reviewController.listarMinhasReviews
);

router.get(
  '/:id',
  validateDto(getReviewSchema),
  reviewController.obterReview
);

router.post(
  '/',
  validateDto(createReviewSchema.shape.body),
  reviewController.criarReview
);

router.put(
  '/:id',
  validateDto(updateReviewSchema),
  reviewController.atualizarReview
);

router.delete(
  '/:id',
  validateDto(deleteReviewSchema),
  reviewController.deletarReview
);

export default router;
