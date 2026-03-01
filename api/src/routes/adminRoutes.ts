import express, { type Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as analyticsController from '../controllers/analyticsController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';

const router: Router = express.Router();

router.use(betterAuthMiddleware, adminOnly);

router.get('/stats', adminController.obterEstatisticas);
router.get('/cursos-populares', adminController.obterCursosMaisPopulares);

// Analytics routes
router.get('/analytics/kpis', analyticsController.obterKPIs);
router.get('/analytics/conclusoes', analyticsController.obterConclusoesMensais);
router.get('/analytics/cursos', analyticsController.obterAnalyticsCursos);
router.get('/analytics/exportar', analyticsController.exportarCSV);

export default router;
