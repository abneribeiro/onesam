import express, { type Router } from 'express';
import * as aulaController from '../controllers/aulaController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { uploadVideo } from '../middlewares/uploadMiddleware';
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

// Rotas públicas (formandos podem visualizar)
router.get('/', betterAuthMiddleware, aulaController.listarAulas);

router.get(
  '/modulo/:IDModulo',
  betterAuthMiddleware,
  validateDto(listAulasByModuloSchema),
  aulaController.listarAulasPorModulo
);

// Rotas protegidas (apenas admin) - devem vir antes de /:IDAula
router.put(
  '/modulo/:IDModulo/reorder',
  betterAuthMiddleware,
  adminOnly,
  aulaController.reordenarAulas
);

// Rota de upload de vídeo (admin)
router.post(
  '/upload-video',
  betterAuthMiddleware,
  adminOnly,
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
  adminOnly,
  validateDto(createAulaSchema.shape.body),
  aulaController.criarAula
);

router.put(
  '/:IDAula',
  betterAuthMiddleware,
  adminOnly,
  validateDto(updateAulaSchema),
  aulaController.atualizarAula
);

router.delete(
  '/:IDAula',
  betterAuthMiddleware,
  adminOnly,
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
