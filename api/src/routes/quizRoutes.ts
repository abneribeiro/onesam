import express, { type Router } from 'express';
import * as quizController from '../controllers/quizController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';

const router: Router = express.Router();

// All quiz routes require authentication
router.use(betterAuthMiddleware);

// Admin routes for quiz management
router.post('/', adminOnly, quizController.criarQuiz);
router.get('/aula/:aulaId', adminOnly, quizController.listarQuizzesPorAula);
router.get('/:id', adminOnly, quizController.obterQuiz);
router.put('/:id', adminOnly, quizController.atualizarQuiz);
router.delete('/:id', adminOnly, quizController.deletarQuiz);

// Student routes for taking quizzes
router.get('/:id/resolver', quizController.obterQuizParaResolver);
router.post('/:id/submeter', quizController.submeterQuiz);
router.get('/:id/tentativas', quizController.obterTentativasQuiz);
router.get('/:id/pode-reitentar', quizController.verificarPodeReitentar);

export default router;