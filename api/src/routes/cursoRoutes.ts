import express, { type Router } from 'express';
import * as cursoController from '../controllers/cursoController';
import betterAuthMiddleware, { optionalAuthMiddleware } from '../middlewares/betterAuthMiddleware';
import { adminOnly } from '../middlewares/rbacMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { createCursoSchema, updateCursoSchema } from '../schemas/cursoSchemas';
import { uploadCourseImage } from '../middlewares/uploadMiddleware';

const router: Router = express.Router();

// Rotas públicas com autenticação opcional para personalizar resposta
router.get('/', optionalAuthMiddleware, cursoController.listarCursos);
router.get('/:id', optionalAuthMiddleware, cursoController.obterCurso);

router.use(betterAuthMiddleware);

router.post(
  '/',
  adminOnly,
  uploadCourseImage.single('imagemCurso'),
  validateDto(createCursoSchema.shape.body),
  cursoController.criarCurso
);

router.put(
  '/:id',
  adminOnly,
  uploadCourseImage.single('imagemCurso'),
  validateDto(updateCursoSchema.shape.body),
  cursoController.atualizarCurso
);

router.put('/:id/estado', adminOnly, cursoController.alterarEstado);

router.delete('/:id', adminOnly, cursoController.deletarCurso);
router.post('/bulk-delete', adminOnly, cursoController.deletarCursosEmMassa);

export default router;
