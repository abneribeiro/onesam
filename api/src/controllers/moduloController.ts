import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { moduloService } from '../services/moduloService';
import { sendData, sendCreated, sendSuccess } from '../utils/responseHelper';

export const criarModulo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDCurso, ...resto } = req.body;
    const modulo = await moduloService.create({
      cursoId: IDCurso,
      ...resto
    });
    sendCreated(res, 'Módulo criado com sucesso', { modulo });
  } catch (error) {
    next(error);
  }
};

export const listarModulos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const modulos = await moduloService.findAll();
    sendData(res, { modulos });
  } catch (error) {
    next(error);
  }
};

export const listarModulosPorCurso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { IDCurso } = req.params;
    const includeAulas = req.query.includeAulas === 'true';

    const modulos = await moduloService.findByCursoId(Number(IDCurso), includeAulas);
    sendData(res, { modulos });
  } catch (error) {
    next(error);
  }
};

export const obterModulo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { IDModulo } = req.params;
    const includeAulas = req.query.includeAulas === 'true';

    const modulo = await moduloService.findById(Number(IDModulo), includeAulas);
    sendData(res, { modulo });
  } catch (error) {
    next(error);
  }
};

export const atualizarModulo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDModulo } = req.params;
    const modulo = await moduloService.update(Number(IDModulo), req.body);
    sendSuccess(res, 200, 'Módulo atualizado com sucesso', { modulo });
  } catch (error) {
    next(error);
  }
};

export const deletarModulo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDModulo } = req.params;
    await moduloService.delete(Number(IDModulo));
    sendSuccess(res, 200, 'Módulo deletado com sucesso');
  } catch (error) {
    next(error);
  }
};

export const reordenarModulos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { IDCurso } = req.params;
    const { modulos } = req.body; // Array de { id, ordem }

    await moduloService.reorder(Number(IDCurso), modulos);
    sendSuccess(res, 200, 'Módulos reordenados com sucesso');
  } catch (error) {
    next(error);
  }
};
