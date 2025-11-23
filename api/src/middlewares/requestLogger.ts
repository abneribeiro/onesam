import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/auth.types';

const SENSITIVE_FIELDS = ['password', 'palavrapasse', 'senha', 'token', 'refreshToken', 'accessToken'];

const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  return sanitized;
};

/**
 * Middleware para logging estruturado de requisições HTTP com request IDs
 */
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;

  authReq.requestId = req.headers['x-request-id'] as string || uuidv4();
  authReq.startTime = Date.now();

  res.setHeader('X-Request-Id', authReq.requestId);

  logger.debug('Request Started', {
    requestId: authReq.requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    query: Object.keys(req.query).length > 0 ? sanitizeData(req.query) : undefined,
    body: req.method !== 'GET' && Object.keys(req.body || {}).length > 0
      ? sanitizeData(req.body)
      : undefined
  });

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const logResponse = (body?: any) => {
    const duration = Date.now() - (authReq.startTime || Date.now());

    logger.httpRequest(req, res, duration);

    if (res.statusCode >= 400) {
      logger.error('Request Failed', {
        requestId: authReq.requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId: authReq.utilizador?.id || 'anonymous',
        responseBody: body && typeof body === 'object'
          ? JSON.stringify(body).substring(0, 500)
          : undefined
      });
    }

    if (duration > 5000) {
      logger.warn('Very Slow Request', {
        requestId: authReq.requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        userId: authReq.utilizador?.id || 'anonymous'
      });
    }
  };

  res.json = function (body: any) {
    logResponse(body);
    return originalJson(body);
  };

  res.send = function (body: any) {
    logResponse(body);
    return originalSend(body);
  };

  next();
};

export default requestLogger;
