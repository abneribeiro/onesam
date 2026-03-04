import { Router } from 'express';
import {
  listarNotificacoes,
  listarNotificacoesNaoLidas,
  contarNotificacoesNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
} from '../controllers/notificacaoController';
import { validateQuery, validateParams } from '../middlewares/validateDto';
import {
  listarNotificacoesQuerySchema,
  listarNotificacoesNaoLidasQuerySchema,
  contarNotificacoesNaoLidasQuerySchema,
  notificacaoIdSchema,
} from '../schemas/notificacaoSchemas';

const router: Router = Router();

// betterAuthMiddleware is already applied at the app.ts level for /api/notificacoes

// Static routes (no dynamic params)
router.get('/', validateQuery(listarNotificacoesQuerySchema), listarNotificacoes);
router.get('/nao-lidas', validateQuery(listarNotificacoesNaoLidasQuerySchema), listarNotificacoesNaoLidas);
router.get('/nao-lidas/count', validateQuery(contarNotificacoesNaoLidasQuerySchema), contarNotificacoesNaoLidas);
router.put('/marcar-todas-lidas', marcarTodasComoLidas);

// Dynamic param routes
router.put('/:id/marcar-lida', validateParams(notificacaoIdSchema), marcarComoLida);
router.delete('/:id', validateParams(notificacaoIdSchema), deletarNotificacao);

export default router;
