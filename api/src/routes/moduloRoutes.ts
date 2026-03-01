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
} from '../schemas/moduloSchemas';

const router: Router = express.Router();

// Public routes (formandos podem visualizar)
router.get('/', betterAuthMiddleware, moduloController.listarModulos);
router.get(
  '/curso/:IDCurso',
  betterAuthMiddleware,
  moduloController.listarModulosPorCurso
);
router.get(
  '/:IDModulo',
  betterAuthMiddleware,
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
  '/:IDModulo',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  validateDto(updateModuloSchema.shape.body),
  moduloController.atualizarModulo
);

router.delete(
  '/:IDModulo',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.DELETE),
  moduloController.deletarModulo
);

router.put(
  '/curso/:IDCurso/reorder',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  stateChangeRateLimiter,
  moduloController.reordenarModulos
);

export default router;
