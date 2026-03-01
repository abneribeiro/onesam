import express, { type Router } from 'express';
import * as aulaController from '../controllers/aulaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
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
  '/progresso/curso/:IDCurso',
  betterAuthMiddleware,
  aulaController.obterProgressoCurso
);

// Public routes (formandos podem visualizar)
router.get('/', betterAuthMiddleware, aulaController.listarAulas);

router.get(
  '/modulo/:IDModulo',
  betterAuthMiddleware,
  validateDto(listAulasByModuloSchema),
  aulaController.listarAulasPorModulo
);

// Protected admin routes - require specific CONTEUDO permissions
router.put(
  '/modulo/:IDModulo/reorder',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  stateChangeRateLimiter,
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

// Rotas com parâmetro dinâmico /:IDAula - devem vir por último
router.get(
  '/:IDAula',
  betterAuthMiddleware,
  validateDto(getAulaSchema),
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
  '/:IDAula',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.UPDATE),
  validateDto(updateAulaSchema),
  aulaController.atualizarAula
);

router.delete(
  '/:IDAula',
  betterAuthMiddleware,
  can(Resource.CONTEUDO, Action.DELETE),
  validateDto(deleteAulaSchema),
  aulaController.deletarAula
);

router.post(
  '/:IDAula/concluir',
  betterAuthMiddleware,
  validateDto(marcarAulaConcluidaSchema.shape.body),
  aulaController.marcarAulaConcluida
);

router.delete(
  '/:IDAula/concluir',
  betterAuthMiddleware,
  validateDto(getAulaSchema),
  aulaController.desmarcarAulaConcluida
);

export default router;
