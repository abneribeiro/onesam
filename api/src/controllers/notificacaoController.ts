import type { Response, NextFunction } from 'express';
import { notificacaoService } from '../services/notificacaoService';
import { sendSuccess, sendData } from '../utils/responseHelper';
import type { AuthenticatedRequest } from '../types';

export const listarNotificacoes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const notificacoes = await notificacaoService.listarPorUtilizador(utilizadorId);
    sendData(res, notificacoes);
  } catch (error) {
    next(error);
  }
};

export const listarNotificacoesNaoLidas = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const notificacoes = await notificacaoService.listarNaoLidas(utilizadorId);
    sendData(res, notificacoes);
  } catch (error) {
    next(error);
  }
};

export const contarNotificacoesNaoLidas = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const count = await notificacaoService.contarNaoLidas(utilizadorId);
    sendData(res, { count });
  } catch (error) {
    next(error);
  }
};

export const marcarComoLida = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    const notificacao = await notificacaoService.marcarComoLida(Number(id), utilizadorId);
    sendSuccess(res, 200, 'Notificação marcada como lida', { notificacao });
  } catch (error: any) {
    next(error);
  }
};

export const marcarTodasComoLidas = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    await notificacaoService.marcarTodasComoLidas(utilizadorId);
    sendSuccess(res, 200, 'Todas as notificações foram marcadas como lidas');
  } catch (error) {
    next(error);
  }
};

export const deletarNotificacao = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    await notificacaoService.deletar(Number(id), utilizadorId);
    sendSuccess(res, 200, 'Notificação deletada com sucesso');
  } catch (error: any) {
    next(error);
  }
};
