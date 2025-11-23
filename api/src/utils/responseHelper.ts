import { Response } from 'express';

/**
 * Helper para padronizar respostas da API
 * Padrão português: mensagem/erro/dados
 */

interface SuccessResponse {
  mensagem?: string;
  dados?: any;
}

interface ErrorResponse {
  erro: string;
  detalhes?: string | string[];
}

/**
 * Envia resposta de sucesso padronizada
 * @param res - Express Response object
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Mensagem de sucesso (opcional)
 * @param data - Dados a retornar (opcional)
 */
export const sendSuccess = (
  res: Response,
  statusCode: number = 200,
  message?: string,
  data?: any
): void => {
  const response: SuccessResponse = {};

  if (message) {
    response.mensagem = message;
  }

  if (data !== undefined) {
    response.dados = data;
  }

  // Se não tem mensagem nem dados, retorna os dados diretamente
  if (!message && data !== undefined) {
    res.status(statusCode).json(data);
    return;
  }

  res.status(statusCode).json(response);
};

/**
 * Envia apenas dados sem wrapper (para endpoints que retornam listas/objetos)
 * @param res - Express Response object
 * @param data - Dados a retornar
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendData = (
  res: Response,
  data: any,
  statusCode: number = 200
): void => {
  res.status(statusCode).json(data);
};

/**
 * Envia resposta de erro padronizada
 * @param res - Express Response object
 * @param statusCode - HTTP status code
 * @param errorMessage - Mensagem de erro
 * @param details - Detalhes adicionais do erro (opcional)
 */
export const sendError = (
  res: Response,
  statusCode: number,
  errorMessage: string,
  details?: string | string[]
): void => {
  const response: ErrorResponse = {
    erro: errorMessage
  };

  if (details) {
    response.detalhes = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Envia resposta de erro 400 (Bad Request)
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Requisição inválida',
  details?: string | string[]
): void => {
  sendError(res, 400, message, details);
};

/**
 * Envia resposta de erro 401 (Unauthorized)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Não autorizado'
): void => {
  sendError(res, 401, message);
};

/**
 * Envia resposta de erro 403 (Forbidden)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Sem permissão para acessar este recurso'
): void => {
  sendError(res, 403, message);
};

/**
 * Envia resposta de erro 404 (Not Found)
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Recurso não encontrado'
): void => {
  sendError(res, 404, message);
};

/**
 * Envia resposta de erro 500 (Internal Server Error)
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Erro interno do servidor'
): void => {
  sendError(res, 500, message);
};

/**
 * Envia resposta de sucesso 201 (Created)
 */
export const sendCreated = (
  res: Response,
  message: string,
  data?: any
): void => {
  sendSuccess(res, 201, message, data);
};

/**
 * Envia resposta de sucesso 204 (No Content)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
