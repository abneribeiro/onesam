import express, { type Router } from 'express';
import * as cursoController from '../controllers/cursoController';
import betterAuthMiddleware, { optionalAuthMiddleware } from '../middlewares/betterAuthMiddleware';
import { can } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import {
  bulkOperationsRateLimiter,
  stateChangeRateLimiter,
  fileUploadRateLimiter
} from '../middlewares/rateLimitMiddleware';
import { Action, Resource } from '../types/permissions.types';
import {
  createCursoSchema,
  updateCursoSchema,
  getCursoSchema,
  alterarEstadoSchema,
  deletarCursoSchema,
  deletarCursosEmMassaSchema,
  listarCursosSchema
} from '../schemas/cursoSchemas';
import { uploadCourseImage } from '../middlewares/uploadMiddleware';

const router: Router = express.Router();

// Rotas públicas com autenticação opcional para personalizar resposta
router.get('/', optionalAuthMiddleware, validateDto(listarCursosSchema), cursoController.listarCursos);
router.get('/:id', optionalAuthMiddleware, validateDto(getCursoSchema), cursoController.obterCurso);

router.use(betterAuthMiddleware);

// Admin routes with granular permissions, validation, and rate limiting
router.post(
  '/',
  fileUploadRateLimiter,
  can(Resource.CURSO, Action.CREATE),
  uploadCourseImage.single('imagemCurso'),
  validateDto(createCursoSchema.shape.body),
  cursoController.criarCurso
);

router.put(
  '/:id',
  fileUploadRateLimiter,
  can(Resource.CURSO, Action.UPDATE),
  uploadCourseImage.single('imagemCurso'),
  validateDto(updateCursoSchema.shape.body),
  cursoController.atualizarCurso
);

router.put('/:id/estado', stateChangeRateLimiter, can(Resource.CURSO, Action.UPDATE), validateDto(alterarEstadoSchema), cursoController.alterarEstado);
router.delete('/:id', can(Resource.CURSO, Action.DELETE), validateDto(deletarCursoSchema), cursoController.deletarCurso);
router.post('/bulk-delete', bulkOperationsRateLimiter, can(Resource.CURSO, Action.DELETE), validateDto(deletarCursosEmMassaSchema), cursoController.deletarCursosEmMassa);

export default router;
