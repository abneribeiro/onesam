import express, { type Router } from 'express';
import * as aulaController from '../controllers/aulaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto, validateParams } from '../middlewares/validateDto';
import { uploadVideo } from '../middlewares/uploadMiddleware';
import { fileUploadRateLimiter, stateChangeRateLimiter } from '../middlewares/rateLimitMiddleware';
import { Resource, Action } from '../types/permissions.types';
import {
  createAulaSchema,
  updateAulaSchema,
  getAulaSchema,
  deleteAulaSchema,
  listAulasByModuloSchema,
  marcarAulaConcluidaSchema,
  progressoCursoSchema,
  reorderAulasSchema,
} from '../schemas/aulaSchemas';

const router: Router = express.Router();

// === ROTAS DE PROGRESSO (Formandos) ===
// IMPORTANTE: Estas rotas devem vir ANTES das rotas com parâmetros dinâmicos
// para evitar que /progresso/meu seja capturado como /:IDAula

router.get(
  '/progresso/meu',
  betterAuthMiddleware,
  aulaController.obterMeuProgresso
);

router.get(
  '/progresso/curso/:cursoId',
  betterAuthMiddleware,
  validateParams(progressoCursoSchema.shape.params),
  aulaController.obterProgressoCurso
);

// Public routes (formandos podem visualizar)
router.get('/', betterAuthMiddleware, aulaController.listarAulas);

router.get(
  '/modulo/:moduloId',
  betterAuthMiddleware,
  validateParams(listAulasByModuloSchema.shape.params),
  aulaController.listarAulasPorModulo
);

// Protected admin routes - require specific CONTEUDO permissions
router.put(
  '/modulo/:moduloId/reorder',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  stateChangeRateLimiter,
  validateParams(reorderAulasSchema.shape.params),
  validateDto(reorderAulasSchema.shape.body),
  aulaController.reordenarAulas
);

// File upload route with enhanced security (admin only)
router.post(
  '/upload-video',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.CREATE),
  fileUploadRateLimiter,
  uploadVideo.single('video'),
  aulaController.uploadVideo
);

// Rotas com parâmetro dinâmico /:aulaId - devem vir por último
router.get(
  '/:aulaId',
  betterAuthMiddleware,
  validateParams(getAulaSchema.shape.params),
  aulaController.obterAula
);

router.post(
  '/',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.CREATE),
  validateDto(createAulaSchema.shape.body),
  aulaController.criarAula
);

router.put(
  '/:aulaId',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  validateParams(updateAulaSchema.shape.params),
  validateDto(updateAulaSchema.shape.body),
  aulaController.atualizarAula
);

router.delete(
  '/:aulaId',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.DELETE),
  validateParams(deleteAulaSchema.shape.params),
  aulaController.deletarAula
);

router.post(
  '/:aulaId/concluir',
  betterAuthMiddleware,
  validateParams(marcarAulaConcluidaSchema.shape.params),
  validateDto(marcarAulaConcluidaSchema.shape.body),
  aulaController.marcarAulaConcluida
);

router.delete(
  '/:aulaId/concluir',
  betterAuthMiddleware,
  validateParams(getAulaSchema.shape.params),
  aulaController.desmarcarAulaConcluida
);

export default router;
