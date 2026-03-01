import express, { type Router } from 'express';
import * as areaController from '../controllers/areaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../utils/validationHelper';
import { bulkOperationsRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
import { createAreaSchema, updateAreaSchema, getAreaSchema } from '../schemas/areaSchemas';

const router: Router = express.Router();

// Public routes (anyone can view areas)
router.get('/', areaController.listarAreas);
router.get('/:id', validateRequest(getAreaSchema), areaController.obterArea);

// Protected admin routes - require specific AREA permissions
router.post(
  '/',
  betterAuthMiddleware,
  can(Resource.AREA, Action.CREATE),
  validateRequest(createAreaSchema),
  areaController.criarArea
);

router.put(
  '/:id',
  betterAuthMiddleware,
  can(Resource.AREA, Action.UPDATE),
  validateRequest(updateAreaSchema),
  areaController.atualizarArea
);

router.delete(
  '/:id',
  betterAuthMiddleware,
  can(Resource.AREA, Action.DELETE),
  validateRequest(getAreaSchema),
  areaController.deletarArea
);

router.post(
  '/bulk-delete',
  betterAuthMiddleware,
  can(Resource.AREA, Action.DELETE),
  bulkOperationsRateLimiter,
  areaController.deletarAreasEmMassa
);

export default router;
