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

export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (!isErrorWithResponse(error)) {
    return defaultMessage;
  }

  if (error.response?.data?.error?.message) {
    return String(error.response.data.error.message);
  }

  if (error.response?.data?.erro) {
    return String(error.response.data.erro);
  }

  if (error.response?.data?.mensagem) {
    return String(error.response.data.mensagem);
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

export const extractValidationErrors = (error: unknown): ValidationError[] => {
  if (!isErrorWithResponse(error)) {
    return [];
  }

  if (error.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
    return error.response.data.error.details.map(d => ({
      campo: d.campo || d.field || '',
      mensagem: d.mensagem || d.message || ''
    }));
  }

  if (error.response?.data?.erros && Array.isArray(error.response.data.erros)) {
    return error.response.data.erros;
  }
  return [];
};
