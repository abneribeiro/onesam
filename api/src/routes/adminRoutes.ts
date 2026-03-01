import express, { type Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as analyticsController from '../controllers/analyticsController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../utils/validationHelper';
import { bulkOperationsRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
import {
  adminStatsSchema,
  cursosMaisPopularesSchema,
  analyticsKPIsSchema,
  conclusoesMensaisSchema,
  analyticsCursosSchema,
  exportarCSVSchema,
} from '../schemas/adminSchemas';

const router: Router = express.Router();

// Apply authentication and general rate limiting to all admin routes
router.use(betterAuthMiddleware);

// Admin statistics routes - require ADMIN:READ permission
router.get(
  '/stats',
  can(Resource.ADMIN, Action.READ),
  validateRequest(adminStatsSchema),
  adminController.obterEstatisticas
);

router.get(
  '/cursos-populares',
  can(Resource.ADMIN, Action.READ),
  validateRequest(cursosMaisPopularesSchema),
  adminController.obterCursosMaisPopulares
);

// Analytics routes - require ADMIN:READ permission with rate limiting for sensitive operations
router.get(
  '/analytics/kpis',
  can(Resource.ADMIN, Action.READ),
  validateRequest(analyticsKPIsSchema),
  analyticsController.obterKPIs
);

router.get(
  '/analytics/conclusoes',
  can(Resource.ADMIN, Action.READ),
  validateRequest(conclusoesMensaisSchema),
  analyticsController.obterConclusoesMensais
);

router.get(
  '/analytics/cursos',
  can(Resource.ADMIN, Action.READ),
  validateRequest(analyticsCursosSchema),
  analyticsController.obterAnalyticsCursos
);

// CSV export - requires ADMIN:EXPORT permission with bulk operations rate limiting
router.get(
  '/analytics/exportar',
  can(Resource.ADMIN, Action.EXPORT),
  bulkOperationsRateLimiter,
  validateRequest(exportarCSVSchema),
  analyticsController.exportarCSV
);

export default router;
