import express, { type Router } from 'express';
import * as inscricaoController from '../controllers/inscricaoController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { formandoOnly, can } from '../middlewares/rbacMiddleware';
import { validateDto, validateParams } from '../middlewares/validateDto';
import { stateChangeRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
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
router.get('/', betterAuthMiddleware, can(Resource.INSCRICAO, Action.MANAGE), inscricaoController.listarTodasInscricoes);
router.get('/minhas', betterAuthMiddleware, inscricaoController.listarMinhasInscricoes);

router.post(
  '/',
  betterAuthMiddleware,
  formandoOnly,
  validarInscricao,
  inscricaoController.inscreverFormando
);

// Rotas com parâmetros dinâmicos por último
// SECURITY: Granular RBAC - apenas admins com permissão de gestão podem ver inscrições de cursos
router.get('/curso/:id', betterAuthMiddleware, can(Resource.INSCRICAO, Action.MANAGE), validarIdParam, inscricaoController.listarInscricoesPorCurso);

// State change operations require specific RBAC permissions and rate limiting
router.put(
  '/:id/aprovar',
  betterAuthMiddleware,
  can(Resource.INSCRICAO, Action.APPROVE),
  stateChangeRateLimiter,
  validarIdParam,
  inscricaoController.aprovarInscricao
);

router.put(
  '/:id/rejeitar',
  betterAuthMiddleware,
  can(Resource.INSCRICAO, Action.APPROVE),
  stateChangeRateLimiter,
  validarIdParam,
  validarRejeicao,
  inscricaoController.rejeitarInscricao
);

router.put('/:id/cancelar', betterAuthMiddleware, validarIdParam, inscricaoController.cancelarInscricao);

export default router;
