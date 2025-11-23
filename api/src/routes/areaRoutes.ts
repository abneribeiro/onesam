import express, { type Router } from 'express';
import * as areaController from '../controllers/areaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../utils/validationHelper';
import { createAreaSchema, updateAreaSchema, getAreaSchema } from '../schemas/areaSchemas';

const router: Router = express.Router();

router.get('/', areaController.listarAreas);
router.get('/:id', validateRequest(getAreaSchema), areaController.obterArea);

router.use(betterAuthMiddleware, adminOnly);
router.post('/', validateRequest(createAreaSchema), areaController.criarArea);
router.put('/:id', validateRequest(updateAreaSchema), areaController.atualizarArea);
router.delete('/:id', validateRequest(getAreaSchema), areaController.deletarArea);
router.post('/bulk-delete', areaController.deletarAreasEmMassa);

export default router;
