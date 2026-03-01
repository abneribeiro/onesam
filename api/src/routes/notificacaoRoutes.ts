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
import { validateDto } from '../middlewares/validateDto';
import {
  listarNotificacoesSchema,
  listarNotificacoesNaoLidasSchema,
  contarNotificacoesNaoLidasSchema,
  marcarComoLidaSchema,
  marcarTodasComoLidasSchema,
  deletarNotificacaoSchema
} from '../schemas/notificacaoSchemas';

const router: Router = Router();

router.use(betterAuthMiddleware);

// Rotas estáticas primeiro (sem parâmetros dinâmicos) com validação
router.get('/', validateDto(listarNotificacoesSchema), listarNotificacoes);
router.get('/nao-lidas', validateDto(listarNotificacoesNaoLidasSchema), listarNotificacoesNaoLidas);
router.get('/nao-lidas/count', validateDto(contarNotificacoesNaoLidasSchema), contarNotificacoesNaoLidas);
router.put('/marcar-todas-lidas', validateDto(marcarTodasComoLidasSchema), marcarTodasComoLidas);

// Rotas com parâmetros dinâmicos por último com validação
router.put('/:id/marcar-lida', validateDto(marcarComoLidaSchema), marcarComoLida);
router.delete('/:id', validateDto(deletarNotificacaoSchema), deletarNotificacao);

export default router;
