import { apiService } from '../lib/api';
import {
  isValidationError,
  isAuthenticationError,
  isPermissionError,
  isRateLimitError,
  extractErrorMessage,
  extractValidationErrors
} from '../lib/errorHandler';
import type { Notificacao } from '../types';

export class NotificacaoError extends Error {
  public readonly isValidation: boolean;
  public readonly isAuthentication: boolean;
  public readonly isPermission: boolean;
  public readonly isRateLimit: boolean;
  public readonly validationErrors: Array<{ field: string; message: string }>;
  public readonly statusCode?: number;

  constructor(originalError: unknown, operation: string) {
    const message = extractErrorMessage(originalError, `Erro ao ${operation}`);
    super(message);

    this.name = 'NotificacaoError';
    this.isValidation = isValidationError(originalError);
    this.isAuthentication = isAuthenticationError(originalError);
    this.isPermission = isPermissionError(originalError);
    this.isRateLimit = isRateLimitError(originalError);

    // Transform validation errors to ensure required fields
    this.validationErrors = extractValidationErrors(originalError).map(error => ({
      field: error.field || error.campo || '',
      message: error.message || error.mensagem || ''
    }));

    // Extract status code if available
    if (typeof originalError === 'object' && originalError !== null && 'response' in originalError) {
      const errorWithResponse = originalError as { response?: { status?: number } };
      this.statusCode = errorWithResponse.response?.status;
    }
  }
}

class NotificacaoService {
  async listarNotificacoes(limit = 50): Promise<Notificacao[]> {
    try {
      return await apiService.get<Notificacao[]>('/notificacoes', {
        params: { limit }
      });
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'listar notificações');
    }
  }

  async listarNaoLidas(limit = 50): Promise<Notificacao[]> {
    try {
      return await apiService.get<Notificacao[]>('/notificacoes/nao-lidas', {
        params: { limit }
      });
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'listar notificações não lidas');
    }
  }

  async contarNaoLidas(): Promise<{ count: number }> {
    try {
      return await apiService.get<{ count: number }>('/notificacoes/nao-lidas/count');
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'contar notificações não lidas');
    }
  }

  async marcarComoLida(id: number): Promise<Notificacao> {
    try {
      return await apiService.put<Notificacao>(`/notificacoes/${id}/marcar-lida`);
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'marcar notificação como lida');
    }
  }

  async marcarTodasComoLidas(): Promise<void> {
    try {
      await apiService.put('/notificacoes/marcar-todas-lidas');
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'marcar todas as notificações como lidas');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await apiService.delete(`/notificacoes/${id}`);
    } catch (error: unknown) {
      throw new NotificacaoError(error, 'deletar notificação');
    }
  }
}

export const notificacaoService = new NotificacaoService();
export default NotificacaoService;
