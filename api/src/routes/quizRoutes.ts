import express, { type Router } from 'express';
import * as quizController from '../controllers/quizController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { quizSubmissionRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Action, Resource } from '../types/permissions.types';
import {
  createQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
  getQuizSchema,
  getQuizzesByLessonSchema,
  checkRetrySchema,
  getAttemptsSchema
} from '../schemas/quizSchemas';

const router: Router = express.Router();

// All quiz routes require authentication
router.use(betterAuthMiddleware);

// Admin routes for quiz management (with granular permissions and validation)
router.post('/', can(Resource.AVALIACAO, Action.CREATE), validateDto(createQuizSchema), quizController.criarQuiz);
router.get('/aula/:aulaId', can(Resource.AVALIACAO, Action.READ), validateDto(getQuizzesByLessonSchema), quizController.listarQuizzesPorAula);
router.get('/:id', can(Resource.AVALIACAO, Action.READ), validateDto(getQuizSchema), quizController.obterQuiz);
router.put('/:id', can(Resource.AVALIACAO, Action.UPDATE), validateDto(updateQuizSchema), quizController.atualizarQuiz);
router.delete('/:id', can(Resource.AVALIACAO, Action.DELETE), validateDto(getQuizSchema), quizController.deletarQuiz);

// Student routes for taking quizzes (with proper validation and rate limiting)
router.get('/:id/resolver', can(Resource.AVALIACAO, Action.READ), validateDto(getQuizSchema), quizController.obterQuizParaResolver);
router.post('/:id/submeter', quizSubmissionRateLimiter, can(Resource.AVALIACAO, Action.READ), validateDto(submitQuizSchema), quizController.submeterQuiz);
router.get('/:id/tentativas', can(Resource.AVALIACAO, Action.READ), validateDto(getAttemptsSchema), quizController.obterTentativasQuiz);
router.get('/:id/pode-reitentar', can(Resource.AVALIACAO, Action.READ), validateDto(checkRetrySchema), quizController.verificarPodeReitentar);

export default router;