import express, { type Router } from 'express';
import * as moduloController from '../controllers/moduloController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto, validateParams } from '../middlewares/validateDto';
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
  validateParams(listModulosByCursoSchema.shape.params),
  moduloController.listarModulosPorCurso
);
router.get(
  '/:moduloId',
  betterAuthMiddleware,
  validateParams(getModuloSchema.shape.params),
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
  validateParams(updateModuloSchema.shape.params),
  validateDto(updateModuloSchema.shape.body),
  moduloController.atualizarModulo
);

router.delete(
  '/:moduloId',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.DELETE),
  validateParams(deleteModuloSchema.shape.params),
  moduloController.deletarModulo
);

router.put(
  '/curso/:cursoId/reorder',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  stateChangeRateLimiter,
  validateParams(reorderModulosSchema.shape.params),
  validateDto(reorderModulosSchema.shape.body),
  moduloController.reordenarModulos
);

export default router;
