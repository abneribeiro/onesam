import express, { type Router } from 'express';
import * as moduloController from '../controllers/moduloController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import {
  createModuloSchema,
  updateModuloSchema,
} from '../schemas/moduloSchemas';

const router: Router = express.Router();

// Rotas públicas (formandos podem visualizar)
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

// Rotas protegidas (apenas admin)
router.post(
  '/',
  betterAuthMiddleware,
  adminOnly,
  validateDto(createModuloSchema.shape.body),
  moduloController.criarModulo
);

router.put(
  '/:IDModulo',
  betterAuthMiddleware,
  adminOnly,
  validateDto(updateModuloSchema.shape.body),
  moduloController.atualizarModulo
);

router.delete(
  '/:IDModulo',
  betterAuthMiddleware,
  adminOnly,
  moduloController.deletarModulo
);

router.put(
  '/curso/:IDCurso/reorder',
  betterAuthMiddleware,
  adminOnly,
  moduloController.reordenarModulos
);

export default router;
