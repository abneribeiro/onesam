import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { analyticsService } from '../services/analyticsService';
import { sendData, sendBadRequest } from '../utils/responseHelper';

export const obterKPIs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kpis = await analyticsService.obterKPIs();
    sendData(res, kpis);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const obterConclusoesMensais = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dados = await analyticsService.obterConclusoesMensais();
    sendData(res, dados);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const obterAnalyticsCursos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await analyticsService.obterAnalyticsCursos();
    sendData(res, analytics);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const exportarCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dados = await analyticsService.exportarDados();
    const csvContent = analyticsService.gerarCSV(dados);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-inscricoes-${new Date().toISOString().split('T')[0]}.csv"`);

    // Add BOM for proper Excel UTF-8 handling
    res.write('\ufeff');
    res.send(csvContent);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};