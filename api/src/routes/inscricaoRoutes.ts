import express, { type Router } from 'express';
import * as inscricaoController from '../controllers/inscricaoController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { formandoOnly, adminOnly } from '../middlewares/rbacMiddleware';
import { validateDto, validateParams } from '../middlewares/validateDto';
import {
  createInscricaoSchema,
  idParamSchema,
  rejeitarInscricaoSchema
} from '../schemas/inscricaoSchemas';

const router: Router = express.Router();

// Validação com Zod
const validarInscricao = validateDto(createInscricaoSchema.shape.body);
const validarIdParam = validateParams(idParamSchema);
const validarRejeicao = validateDto(rejeitarInscricaoSchema);

// Rotas estáticas e específicas primeiro
router.get('/', betterAuthMiddleware, adminOnly, inscricaoController.listarTodasInscricoes);
router.get('/minhas', betterAuthMiddleware, inscricaoController.listarMinhasInscricoes);

router.post(
  '/',
  betterAuthMiddleware,
  formandoOnly,
  validarInscricao,
  inscricaoController.inscreverFormando
);

// Rotas com parâmetros dinâmicos por último
// SECURITY: Adicionado adminOnly para garantir que apenas admins vejam inscrições de cursos
router.get('/curso/:id', betterAuthMiddleware, adminOnly, validarIdParam, inscricaoController.listarInscricoesPorCurso);
router.put('/:id/aprovar', betterAuthMiddleware, adminOnly, validarIdParam, inscricaoController.aprovarInscricao);
router.put('/:id/rejeitar', betterAuthMiddleware, adminOnly, validarIdParam, validarRejeicao, inscricaoController.rejeitarInscricao);
router.put('/:id/cancelar', betterAuthMiddleware, validarIdParam, inscricaoController.cancelarInscricao);

export default router;
