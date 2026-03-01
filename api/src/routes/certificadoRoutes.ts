import express, { type Router } from 'express';
import * as certificadoController from '../controllers/certificadoController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';
import { validateDto } from '../middlewares/validateDto';
import { certificateRateLimiter } from '../middlewares/rateLimitMiddleware';
import {
  validarCertificadoSchema,
  gerarCertificadoSchema,
  downloadCertificadoSchema,
  verificarElegibilidadeSchema,
  listarCertificadosSchema
} from '../schemas/certificadoSchemas';

const router: Router = express.Router();

// Public route for certificate validation
router.get('/validar/:codigo', validateDto(validarCertificadoSchema), certificadoController.validarCertificado);

// Authenticated routes
router.use(betterAuthMiddleware);

// Student routes with proper validation and rate limiting
router.get('/', validateDto(listarCertificadosSchema), certificadoController.listarCertificados);
router.get('/download/:cursoId', certificateRateLimiter, validateDto(downloadCertificadoSchema), certificadoController.downloadCertificado);
router.get('/elegibilidade/:cursoId', validateDto(verificarElegibilidadeSchema), certificadoController.verificarElegibilidade);
router.post('/gerar/:cursoId', certificateRateLimiter, validateDto(gerarCertificadoSchema), certificadoController.gerarCertificado);

export default router;