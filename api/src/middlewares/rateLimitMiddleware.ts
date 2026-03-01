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

/**
 * Enhanced rate limiters for specific security-sensitive operations
 */

// Rate limiter for user creation (admin only)
export const createUserRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 minute in dev, 1 hour in prod
  max: isDevelopment ? 50 : 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_USER_CREATIONS',
      message: 'Muitas criações de utilizadores. Aguarde antes de criar mais utilizadores.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for bulk operations
export const bulkOperationsRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 10 * 60 * 1000, // 1 minute in dev, 10 minutes in prod
  max: isDevelopment ? 20 : 3,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_BULK_OPERATIONS',
      message: 'Muitas operações em lote. Aguarde alguns minutos antes de repetir.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password changes
export const passwordChangeRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 minute in dev, 1 hour in prod
  max: isDevelopment ? 20 : 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_PASSWORD_CHANGES',
      message: 'Muitas alterações de senha. Aguarde uma hora antes de tentar novamente.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for certificate generation
export const certificateRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 10 * 60 * 1000, // 1 minute in dev, 10 minutes in prod
  max: isDevelopment ? 20 : 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_CERTIFICATE_REQUESTS',
      message: 'Muitas solicitações de certificado. Aguarde alguns minutos antes de tentar novamente.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for quiz submissions
export const quizSubmissionRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in prod
  max: isDevelopment ? 50 : 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_QUIZ_SUBMISSIONS',
      message: 'Muitas submissões de quiz. Aguarde alguns minutos antes de tentar novamente.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads
export const fileUploadRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
  max: isDevelopment ? 50 : 20,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_FILE_UPLOADS',
      message: 'Muitos uploads de ficheiros. Aguarde alguns minutos antes de tentar novamente.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for admin state changes (course state, user activation)
export const stateChangeRateLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in prod
  max: isDevelopment ? 100 : 30,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_STATE_CHANGES',
      message: 'Muitas alterações de estado. Aguarde alguns minutos antes de continuar.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
