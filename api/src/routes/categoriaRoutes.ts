import express, { type Router } from 'express';
import * as categoriaController from '../controllers/categoriaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../utils/validationHelper';
import { bulkOperationsRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
import {
  createCategoriaSchema,
  updateCategoriaSchema,
  getCategoriaSchema,
} from '../schemas/categoriaSchemas';

const router: Router = express.Router();

// Public routes (anyone can view categories)
router.get('/', categoriaController.listarCategorias);
router.get('/:id', validateRequest(getCategoriaSchema), categoriaController.obterCategoria);

// Protected admin routes - require specific CATEGORIA permissions
router.post(
  '/',
  betterAuthMiddleware,
  can(Resource.CATEGORIA, Action.CREATE),
  validateRequest(createCategoriaSchema),
  categoriaController.criarCategoria
);

router.post(
  '/bulk-delete',
  betterAuthMiddleware,
  can(Resource.CATEGORIA, Action.DELETE),
  bulkOperationsRateLimiter,
  categoriaController.deletarCategoriasEmMassa
);

router.put(
  '/:id',
  betterAuthMiddleware,
  can(Resource.CATEGORIA, Action.UPDATE),
  validateRequest(updateCategoriaSchema),
  categoriaController.atualizarCategoria
);

router.delete(
  '/:id',
  betterAuthMiddleware,
  can(Resource.CATEGORIA, Action.DELETE),
  validateRequest(getCategoriaSchema),
  categoriaController.deletarCategoria
);

export default router;
