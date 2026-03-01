import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { certificadoService } from '../services/certificadoService';
import { sendData, sendCreated, sendBadRequest, sendNotFound } from '../utils/responseHelper';

export const downloadCertificado = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const utilizadorId = req.utilizador!.id;

    // Check if user can generate certificate
    const podeGerar = await certificadoService.podeGerarCertificado(utilizadorId, Number(cursoId));
    if (!podeGerar) {
      sendBadRequest(res, 'Curso não concluído. Complete todas as aulas para obter o certificado.');
      return;
    }

    // Generate or get existing certificate
    const certificado = await certificadoService.gerarCertificado(utilizadorId, Number(cursoId));

    // Generate PDF
    const pdfBuffer = await certificadoService.gerarPDF(certificado.codigoHash);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${certificado.codigoHash.substring(0, 8)}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const validarCertificado = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codigo = Array.isArray(req.params.codigo) ? req.params.codigo[0] : req.params.codigo;
    const resultado = await certificadoService.validarCertificado(codigo);

    if (!resultado.valido) {
      sendNotFound(res, resultado.erro || 'Certificado inválido');
      return;
    }

    sendData(res, resultado.dados);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const gerarCertificado = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const utilizadorId = req.utilizador!.id;

    const certificado = await certificadoService.gerarCertificado(utilizadorId, Number(cursoId));
    sendCreated(res, 'Certificado gerado com sucesso', { certificado });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const listarCertificados = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const utilizadorId = req.utilizador!.id;
    const certificados = await certificadoService.listarCertificadosUtilizador(utilizadorId);
    sendData(res, certificados);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const verificarElegibilidade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursoId } = req.params;
    const utilizadorId = req.utilizador!.id;

    const podeGerar = await certificadoService.podeGerarCertificado(utilizadorId, Number(cursoId));
    sendData(res, { podeGerar });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};