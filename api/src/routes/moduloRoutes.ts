import express, { type Router } from 'express';
import * as moduloController from '../controllers/moduloController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { stateChangeRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
import {
  createModuloSchema,
  updateModuloSchema,
  getModuloSchema,
  deleteModuloSchema,
  listModulosByCursoSchema,
  reorderModulosSchema,
} from '../schemas/moduloSchemas';

const router: Router = express.Router();

// Public routes (formandos podem visualizar)
router.get('/', betterAuthMiddleware, moduloController.listarModulos);
router.get(
  '/curso/:cursoId',
  betterAuthMiddleware,
  validateDto(listModulosByCursoSchema),
  moduloController.listarModulosPorCurso
);
router.get(
  '/:moduloId',
  betterAuthMiddleware,
  validateDto(getModuloSchema),
  moduloController.obterModulo
);

// Protected admin routes - require specific CONTEUDO permissions
router.post(
  '/',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.CREATE),
  validateDto(createModuloSchema.shape.body),
  moduloController.criarModulo
);

router.put(
  '/:moduloId',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  validateDto(updateModuloSchema),
  moduloController.atualizarModulo
);

router.delete(
  '/:moduloId',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.DELETE),
  validateDto(deleteModuloSchema),
  moduloController.deletarModulo
);

router.put(
  '/curso/:cursoId/reorder',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  stateChangeRateLimiter,
  validateDto(reorderModulosSchema),
  moduloController.reordenarModulos
);

export default router;
