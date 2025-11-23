import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

export const authRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

export const refreshTokenRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 100 : 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas de renovação de token. Aguarde alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Limite de requisições excedido. Tente novamente em alguns minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path.startsWith('/api/health') ||
           req.path.startsWith('/api/docs') ||
           req.path.startsWith('/api/reference');
  },
});
