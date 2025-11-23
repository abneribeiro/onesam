import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { aulaService } from '../services/aulaService';
import { cursoService } from '../services/cursoService';
import { sendData, sendCreated, sendSuccess } from '../utils/responseHelper';
import { CustomError } from '../utils/errorHandler';

export const criarAula = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDModulo, ...resto } = req.body;
    const aula = await aulaService.create({
      moduloId: IDModulo,
      ...resto
    });
    sendCreated(res, 'Aula criada com sucesso', { aula });
  } catch (error) {
    next(error);
  }
};

export const listarAulas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const aulas = await aulaService.findAll();
    sendData(res, { aulas });
  } catch (error) {
    next(error);
  }
};

export const listarAulasPorModulo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { IDModulo } = req.params;
    const aulas = await aulaService.findByModuloId(Number(IDModulo));
    sendData(res, { aulas });
  } catch (error) {
    next(error);
  }
};

export const obterAula = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDAula } = req.params;
    const utilizadorId = req.utilizador?.id;

    if (utilizadorId) {
      // Se usuário autenticado, incluir progresso
      const aula = await aulaService.findByIdWithProgresso(Number(IDAula), utilizadorId);
      sendData(res, { aula });
    } else {
      // Sem autenticação, apenas a aula
      const aula = await aulaService.findById(Number(IDAula), true);
      sendData(res, { aula });
    }
  } catch (error) {
    next(error);
  }
};

export const atualizarAula = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDAula } = req.params;
    const aula = await aulaService.update(Number(IDAula), req.body);
    sendSuccess(res, 200, 'Aula atualizada com sucesso', { aula });
  } catch (error) {
    next(error);
  }
};

export const deletarAula = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDAula } = req.params;
    await aulaService.delete(Number(IDAula));
    sendSuccess(res, 200, 'Aula deletada com sucesso');
  } catch (error) {
    next(error);
  }
};

export const reordenarAulas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDModulo } = req.params;
    const { aulas } = req.body; // Array de { id, ordem }

    await aulaService.reorder(Number(IDModulo), aulas);
    sendSuccess(res, 200, 'Aulas reordenadas com sucesso');
  } catch (error) {
    next(error);
  }
};

// === CONTROLADORES DE PROGRESSO ===

export const marcarAulaConcluida = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDAula } = req.params;
    const { tempoGasto } = req.body;
    const utilizadorId = req.utilizador!.id;

    const progresso = await aulaService.marcarConcluida(Number(IDAula), utilizadorId, tempoGasto);
    sendSuccess(res, 200, 'Aula marcada como concluída', { progresso });
  } catch (error) {
    next(error);
  }
};

export const desmarcarAulaConcluida = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDAula } = req.params;
    const utilizadorId = req.utilizador!.id;

    const progresso = await aulaService.desmarcarConcluida(Number(IDAula), utilizadorId);
    sendSuccess(res, 200, 'Conclusão da aula removida', { progresso });
  } catch (error) {
    next(error);
  }
};

export const obterProgressoCurso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDCurso } = req.params;
    const utilizadorId = req.utilizador!.id;

    const progresso = await aulaService.calcularProgressoCurso(Number(IDCurso), utilizadorId);
    sendData(res, { progresso });
  } catch (error) {
    next(error);
  }
};

export const obterMeuProgresso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const progressos = await aulaService.getProgressoUtilizador(utilizadorId);
    sendData(res, { progressos });
  } catch (error) {
    next(error);
  }
};

// === CONTROLADORES DE UPLOAD ===

export const uploadVideo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.body;
    const file = req.file;

    if (!file) {
      throw new CustomError('Nenhum arquivo de vídeo enviado', 400);
    }

    if (!cursoId) {
      throw new CustomError('ID do curso é obrigatório', 400);
    }

    await cursoService.obterCurso(Number(cursoId));

    const url = await aulaService.uploadVideo(
      file.buffer,
      Number(cursoId),
      file.originalname,
      file.mimetype
    );

    sendSuccess(res, 200, 'Vídeo enviado com sucesso', { url });
  } catch (error) {
    next(error);
  }
};
