import express, { type Router } from 'express';
import * as utilizadorController from '../controllers/utilizadorController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { uploadAvatar } from '../middlewares/uploadMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { atualizarPerfilSchema, alterarSenhaSchema } from '../schemas/utilizadorSchemas';

const router: Router = express.Router();

router.use(betterAuthMiddleware);

router.get('/perfil', utilizadorController.obterPerfilAtual);
router.put('/perfil', validateDto(atualizarPerfilSchema), utilizadorController.atualizarUtilizador);
router.post('/perfil/avatar', uploadAvatar.single('avatar'), utilizadorController.atualizarAvatar);
router.post('/perfil/senha', validateDto(alterarSenhaSchema), utilizadorController.alterarSenha);
router.get('/perfil-publico/:id', utilizadorController.obterUtilizador);

router.get('/', adminOnly, utilizadorController.listarUtilizadores);
router.post('/bulk-delete', adminOnly, utilizadorController.deletarUtilizadoresEmMassa);
router.get('/:id', adminOnly, utilizadorController.obterUtilizador);
router.post('/', adminOnly, utilizadorController.criarUtilizador);
router.put('/:id', adminOnly, utilizadorController.atualizarUtilizadorAdmin);
router.delete('/:id', adminOnly, utilizadorController.deletarUtilizador);
router.patch('/:id/toggle-ativo', adminOnly, utilizadorController.toggleAtivo);

export default router;
