import express, { type Router } from 'express';
import * as adminController from '../controllers/adminController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';

const router: Router = express.Router();

router.use(betterAuthMiddleware, adminOnly);

router.get('/stats', adminController.obterEstatisticas);
router.get('/cursos-populares', adminController.obterCursosMaisPopulares);

export default router;
