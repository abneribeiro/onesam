interface ApiErrorResponse {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: ValidationError[];
  };
  erro?: string;
  mensagem?: string;
  erros?: ValidationError[];
  // Enhanced error response from new backend validation
  parsedValidationErrors?: Array<{ field: string; message: string }>;
}

interface ErrorWithResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

/**
 * Check if error is an authentication error (401)
 */
export const isAuthenticationError = (error: unknown): boolean => {
  return isErrorWithResponse(error) && error.response?.status === 401;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: unknown): boolean => {
  return isErrorWithResponse(error) && error.response?.status === 403;
};

/**
 * Check if error is a validation error (400 with validation details)
 */
export const isValidationError = (error: unknown): boolean => {
  if (!isErrorWithResponse(error) || error.response?.status !== 400) {
    return false;
  }

  const data = error.response.data;
  return !!(
    data?.error?.details ||
    data?.erros ||
    data?.parsedValidationErrors
  );
};

/**
 * Check if error is a rate limiting error (429)
 */
export const isRateLimitError = (error: unknown): boolean => {
  return isErrorWithResponse(error) && error.response?.status === 429;
};

/**
 * Extract error message with enhanced support for new backend formats
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (!isErrorWithResponse(error)) {
    return defaultMessage;
  }

  const data = error.response?.data;

  // New backend format (standardized)
  if (data?.error?.message) {
    return String(data.error.message);
  }

  // Legacy formats (maintain compatibility)
  if (data?.erro) {
    return String(data.erro);
  }

  if (data?.mensagem) {
    return String(data.mensagem);
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

export const getErrorMessage = (error: unknown, operation: string): string => {
  return extractErrorMessage(error, `Erro ao ${operation}`);
};

export const handleApiError = (error: unknown, operacao: string): never => {
  const mensagem = extractErrorMessage(error, `Erro ao ${operacao}`);
  throw new Error(mensagem);
};

export interface ValidationError {
  campo: string;
  mensagem: string;
  field?: string;
  message?: string;
}

/**
 * Enhanced validation error extraction supporting new backend formats
 */
export const extractValidationErrors = (error: unknown): ValidationError[] => {
  if (!isErrorWithResponse(error)) {
    return [];
  }

  const data = error.response?.data;

  // Enhanced format from API interceptor
  if (data?.parsedValidationErrors && Array.isArray(data.parsedValidationErrors)) {
    return data.parsedValidationErrors.map(e => ({
      campo: e.field,
      mensagem: e.message,
      field: e.field,
      message: e.message,
    }));
  }

  // New backend format
  if (data?.error?.details && Array.isArray(data.error.details)) {
    return data.error.details.map(d => ({
      campo: d.campo || d.field || '',
      mensagem: d.mensagem || d.message || '',
      field: d.campo || d.field || '',
      message: d.mensagem || d.message || ''
    }));
  }

  // Legacy format (maintain compatibility)
  if (data?.erros && Array.isArray(data.erros)) {
    return data.erros;
  }

  return [];
};

/**
 * Get user-friendly error messages for specific error types
 */
export const getErrorTypeMessage = (error: unknown): string => {
  if (isAuthenticationError(error)) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }

  if (isPermissionError(error)) {
    return 'Acesso negado. Não tem permissões para realizar esta operação.';
  }

  if (isRateLimitError(error)) {
    return 'Limite de requisições excedido. Tente novamente em alguns minutos.';
  }

  if (isValidationError(error)) {
    const validationErrors = extractValidationErrors(error);
    if (validationErrors.length > 0) {
      return `Dados inválidos: ${validationErrors.map(e => e.mensagem).join(', ')}`;
    }
    return 'Dados inválidos. Verifique os campos e tente novamente.';
  }

  // Fallback to generic error message
  return extractErrorMessage(error, 'Ocorreu um erro inesperado');
};
