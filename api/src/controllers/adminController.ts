import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { sendData } from '../utils/responseHelper';
import logger from '../utils/logger';

export const obterEstatisticas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await adminService.obterEstatisticas();
    sendData(res, stats);
  } catch (error) {
    logger.error('Erro ao obter estatísticas', error instanceof Error ? error : new Error(String(error)));
    next(error);
  }
};

export const obterCursosMaisPopulares = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const cursos = await adminService.obterCursosMaisPopulares(limit);
    sendData(res, cursos);
  } catch (error) {
    logger.error('Erro ao obter cursos populares', error instanceof Error ? error : new Error(String(error)));
    next(error);
  }
};
