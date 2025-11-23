import express, { type Router } from 'express';
import * as categoriaController from '../controllers/categoriaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../utils/validationHelper';
import {
  createCategoriaSchema,
  updateCategoriaSchema,
  getCategoriaSchema,
} from '../schemas/categoriaSchemas';

const router: Router = express.Router();

router.get('/', categoriaController.listarCategorias);
router.get('/:id', validateRequest(getCategoriaSchema), categoriaController.obterCategoria);

router.use(betterAuthMiddleware, adminOnly);
router.post('/', validateRequest(createCategoriaSchema), categoriaController.criarCategoria);
router.post('/bulk-delete', categoriaController.deletarCategoriasEmMassa);
router.put('/:id', validateRequest(updateCategoriaSchema), categoriaController.atualizarCategoria);
router.delete('/:id', validateRequest(getCategoriaSchema), categoriaController.deletarCategoria);

export default router;
