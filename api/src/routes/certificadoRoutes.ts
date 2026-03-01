import express, { type Router } from 'express';
import * as certificadoController from '../controllers/certificadoController';
import betterAuthMiddleware, { optionalAuthMiddleware } from '../middlewares/betterAuthMiddleware';

const router: Router = express.Router();

// Public route for certificate validation
router.get('/validar/:codigo', certificadoController.validarCertificado);

// Authenticated routes
router.use(betterAuthMiddleware);

// Student routes
router.get('/', certificadoController.listarCertificados);
router.get('/download/:cursoId', certificadoController.downloadCertificado);
router.get('/elegibilidade/:cursoId', certificadoController.verificarElegibilidade);
router.post('/gerar/:cursoId', certificadoController.gerarCertificado);

export default router;