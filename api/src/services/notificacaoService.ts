import { notificacaoRepository } from '../repositories/notificacaoRepository';
import { CustomError } from '../utils/errorHandler';
import type { Notificacao, TipoNotificacao } from '../types';

interface CriarNotificacaoData {
  utilizadorId: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  linkAcao?: string;
}

class NotificacaoService {
  async criar(data: CriarNotificacaoData): Promise<Notificacao> {
    return notificacaoRepository.create({
      utilizadorId: data.utilizadorId,
      tipo: data.tipo,
      titulo: data.titulo,
      mensagem: data.mensagem,
      linkAcao: data.linkAcao,
      lida: false,
    });
  }

  async listarPorUtilizador(utilizadorId: number): Promise<Notificacao[]> {
    return notificacaoRepository.findByUtilizadorId(utilizadorId);
  }

  async listarNaoLidas(utilizadorId: number): Promise<Notificacao[]> {
    return notificacaoRepository.findNaoLidasByUtilizadorId(utilizadorId);
  }

  async contarNaoLidas(utilizadorId: number): Promise<number> {
    return notificacaoRepository.countNaoLidasByUtilizadorId(utilizadorId);
  }

  async marcarComoLida(id: number, utilizadorId: number): Promise<Notificacao> {
    try {
      return await notificacaoRepository.marcarComoLida(id, utilizadorId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Notificação não encontrada ou sem permissão') {
        throw new CustomError('Notificação não encontrada', 404);
      }
      throw new CustomError('Erro ao marcar notificação como lida', 500);
    }
  }

  async marcarTodasComoLidas(utilizadorId: number): Promise<void> {
    await notificacaoRepository.marcarTodasComoLidas(utilizadorId);
  }

  async deletar(id: number, utilizadorId: number): Promise<void> {
    try {
      await notificacaoRepository.delete(id, utilizadorId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Notificação não encontrada ou sem permissão') {
        throw new CustomError('Notificação não encontrada', 404);
      }
      throw new CustomError('Erro ao deletar notificação', 500);
    }
  }

  async criarNotificacaoInscricaoAprovada(utilizadorId: number, nomeCurso: string, cursoId: number): Promise<Notificacao> {
    return this.criar({
      utilizadorId,
      tipo: 'inscricao_aprovada',
      titulo: 'Inscrição Aprovada!',
      mensagem: `A sua inscrição no curso "${nomeCurso}" foi aprovada. Pode agora aceder aos conteúdos.`,
      linkAcao: `/cursos/${cursoId}`,
    });
  }

  async criarNotificacaoInscricaoRejeitada(utilizadorId: number, nomeCurso: string, motivo?: string): Promise<Notificacao> {
    const mensagem = motivo
      ? `A sua inscrição no curso "${nomeCurso}" não foi aprovada. Motivo: ${motivo}`
      : `A sua inscrição no curso "${nomeCurso}" não foi aprovada.`;

    return this.criar({
      utilizadorId,
      tipo: 'inscricao_rejeitada',
      titulo: 'Inscrição Não Aprovada',
      mensagem,
      linkAcao: '/cursos',
    });
  }
}

export const notificacaoService = new NotificacaoService();
export default NotificacaoService;
