import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Notificacao } from '../types';

class NotificacaoService {
  async listarNotificacoes(): Promise<Notificacao[]> {
    try {
      return await apiService.get<Notificacao[]>('/notificacoes');
    } catch (error: unknown) {
      return handleApiError(error, 'listar notificações');
    }
  }

  async listarNaoLidas(): Promise<Notificacao[]> {
    try {
      return await apiService.get<Notificacao[]>('/notificacoes/nao-lidas');
    } catch (error: unknown) {
      return handleApiError(error, 'listar notificações não lidas');
    }
  }

  async contarNaoLidas(): Promise<{ count: number }> {
    try {
      return await apiService.get<{ count: number }>('/notificacoes/nao-lidas/count');
    } catch (error: unknown) {
      return handleApiError(error, 'contar notificações não lidas');
    }
  }

  async marcarComoLida(id: number): Promise<Notificacao> {
    try {
      return await apiService.put<Notificacao>(`/notificacoes/${id}/marcar-lida`);
    } catch (error: unknown) {
      return handleApiError(error, 'marcar notificação como lida');
    }
  }

  async marcarTodasComoLidas(): Promise<void> {
    try {
      await apiService.put('/notificacoes/marcar-todas-lidas');
    } catch (error: unknown) {
      return handleApiError(error, 'marcar todas as notificações como lidas');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await apiService.delete(`/notificacoes/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'deletar notificação');
    }
  }
}

export const notificacaoService = new NotificacaoService();
export default NotificacaoService;
