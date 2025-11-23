import { Router } from 'express';
import {
  listarNotificacoes,
  listarNotificacoesNaoLidas,
  contarNotificacoesNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
} from '../controllers/notificacaoController';
import betterAuthMiddleware from '../middlewares/betterAuthMiddleware';

const router: Router = Router();

router.use(betterAuthMiddleware);

// Rotas estáticas primeiro (sem parâmetros dinâmicos)
router.get('/', listarNotificacoes);
router.get('/nao-lidas', listarNotificacoesNaoLidas);
router.get('/nao-lidas/count', contarNotificacoesNaoLidas);
router.put('/marcar-todas-lidas', marcarTodasComoLidas);

// Rotas com parâmetros dinâmicos por último
router.put('/:id/marcar-lida', marcarComoLida);
router.delete('/:id', deletarNotificacao);

export default router;
