import express, { type Router } from 'express';
import * as utilizadorController from '../controllers/utilizadorController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly, can } from '../middlewares/rbacMiddleware';
import { uploadAvatar } from '../middlewares/uploadMiddleware';
import { validateDto } from '../middlewares/validateDto';
import {
  createUserRateLimiter,
  bulkOperationsRateLimiter,
  passwordChangeRateLimiter,
  stateChangeRateLimiter,
  fileUploadRateLimiter
} from '../middlewares/rateLimitMiddleware';
import { Action, Resource } from '../types/permissions.types';
import {
  atualizarPerfilSchema,
  alterarSenhaSchema,
  criarUtilizadorSchema,
  atualizarUtilizadorAdminSchema,
  toggleAtivoSchema,
  bulkDeleteSchema,
  obterUtilizadorSchema,
  listarUtilizadoresSchema
} from '../schemas/utilizadorSchemas';

const router: Router = express.Router();

router.use(betterAuthMiddleware);

// User profile routes (authenticated users)
router.get('/perfil', utilizadorController.obterPerfilAtual);
router.put('/perfil', validateDto(atualizarPerfilSchema), utilizadorController.atualizarUtilizador);
router.post('/perfil/avatar', fileUploadRateLimiter, uploadAvatar.single('avatar'), utilizadorController.atualizarAvatar);
router.post('/perfil/senha', passwordChangeRateLimiter, validateDto(alterarSenhaSchema), utilizadorController.alterarSenha);
router.get('/perfil-publico/:id', validateDto(obterUtilizadorSchema), utilizadorController.obterUtilizador);

// Admin routes with granular permissions and rate limiting
router.get('/', can(Resource.UTILIZADOR, Action.READ), validateDto(listarUtilizadoresSchema), utilizadorController.listarUtilizadores);
router.post('/bulk-delete', bulkOperationsRateLimiter, can(Resource.UTILIZADOR, Action.DELETE), validateDto(bulkDeleteSchema), utilizadorController.deletarUtilizadoresEmMassa);
router.get('/:id', can(Resource.UTILIZADOR, Action.READ), validateDto(obterUtilizadorSchema), utilizadorController.obterUtilizador);
router.post('/', createUserRateLimiter, can(Resource.UTILIZADOR, Action.CREATE), validateDto(criarUtilizadorSchema), utilizadorController.criarUtilizador);
router.put('/:id', can(Resource.UTILIZADOR, Action.UPDATE), validateDto(atualizarUtilizadorAdminSchema), utilizadorController.atualizarUtilizadorAdmin);
router.delete('/:id', can(Resource.UTILIZADOR, Action.DELETE), validateDto(obterUtilizadorSchema), utilizadorController.deletarUtilizador);
router.patch('/:id/toggle-ativo', stateChangeRateLimiter, can(Resource.UTILIZADOR, Action.UPDATE), validateDto(toggleAtivoSchema), utilizadorController.toggleAtivo);

export default router;
