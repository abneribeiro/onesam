import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { sendData, sendCreated, sendSuccess, sendBadRequest, sendForbidden } from '../utils/responseHelper';
import { inscricaoService } from '../services/inscricaoService';
import type { EstadoInscricao } from '../types';

export const inscreverFormando = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDCurso } = req.body;
    const utilizadorId = req.utilizador!.id;

    const inscricao = await inscricaoService.inscreverFormando(utilizadorId, IDCurso);

    const mensagem = inscricao.estado === 'aceite'
      ? 'Inscrição realizada com sucesso! Você já tem acesso ao curso.'
      : 'Inscrição realizada com sucesso e aguarda aprovação';

    sendCreated(res, mensagem, { inscricao });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

/**
 * Lista inscrições de um curso específico
 * SECURITY: Apenas admins podem ver todas as inscrições de um curso
 * Esta rota já é protegida por adminOnly no router, mas adicionamos verificação extra
 */
export const listarInscricoesPorCurso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUser = req.utilizador!;

    // SECURITY: Apenas admins podem ver inscrições de um curso
    if (requestingUser.tipoPerfil !== 'admin') {
      sendForbidden(res, 'Apenas administradores podem ver inscrições de cursos');
      return;
    }

    const inscricoes = await inscricaoService.listarInscricoesPorCurso(Number(id));
    sendData(res, inscricoes);
  } catch (error: unknown) {
    next(error);
  }
};

export const listarInscricoesFormando = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const inscricoes = await inscricaoService.listarInscricoesFormando(utilizadorId);
    sendData(res, inscricoes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const listarMinhasInscricoes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const inscricoes = await inscricaoService.listarMinhasInscricoes(utilizadorId);
    sendData(res, inscricoes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const listarTodasInscricoes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder, search, estado } = req.query;

    if (page || limit) {
      const result = await inscricaoService.listarTodasPaginadas(
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        {
          sortBy: sortBy as string | undefined,
          sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        },
        {
          search: search as string | undefined,
          estado: estado as EstadoInscricao | undefined,
        }
      );
      sendData(res, result);
    } else {
      const inscricoes = await inscricaoService.listarTodas();
      sendData(res, inscricoes);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const aprovarInscricao = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const inscricaoAtualizada = await inscricaoService.aprovarInscricao(Number(id));
    sendSuccess(res, 200, "Inscrição aprovada com sucesso", { inscricao: inscricaoAtualizada });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const rejeitarInscricao = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const inscricaoAtualizada = await inscricaoService.rejeitarInscricao(Number(id), motivo);
    sendSuccess(res, 200, "Inscrição rejeitada", { inscricao: inscricaoAtualizada });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const cancelarInscricao = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    await inscricaoService.cancelarInscricao(Number(id), utilizadorId);
    sendSuccess(res, 200, "Inscrição cancelada com sucesso");
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};
