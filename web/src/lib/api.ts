import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosProgressEvent } from 'axios';
import type { ApiResponse, ApiError } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private axiosInstance: AxiosInstance;
  private isAuthErrorHandled = false;
  private logoutCallback: (() => Promise<void>) | null = null;
  private errorNotificationCallback: ((message: string) => void) | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set callback functions for authentication handling
   */
  public setAuthCallbacks(logout: () => Promise<void>, showErrorNotification: (message: string) => void): void {
    this.logoutCallback = logout;
    this.errorNotificationCallback = showErrorNotification;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Reset auth error flag on new requests
        this.isAuthErrorHandled = false;
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with enhanced auth error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Handle authentication errors
        if (status === 401 && !this.isAuthErrorHandled) {
          this.isAuthErrorHandled = true;

          if (this.errorNotificationCallback) {
            this.errorNotificationCallback('Sessão expirada. Por favor, faça login novamente.');
          }

          if (this.logoutCallback) {
            try {
              await this.logoutCallback();
            } catch (logoutError) {
              console.error('Error during automatic logout:', logoutError);
            }
          }
        }

        // Handle permission errors (403)
        if (status === 403) {
          const permissionMessage = this.extractPermissionErrorMessage(errorData);

          if (this.errorNotificationCallback) {
            this.errorNotificationCallback(permissionMessage);
          }
        }

        // Handle rate limiting errors (429)
        if (status === 429) {
          const rateLimitMessage = this.extractRateLimitMessage(errorData);

          if (this.errorNotificationCallback) {
            this.errorNotificationCallback(rateLimitMessage);
          }
        }

        // Handle validation errors (400) with better formatting
        if (status === 400 && errorData?.error?.details) {
          // Let the calling component handle validation errors specifically
          // but still provide better error structure
          const enhancedError = {
            ...error,
            response: {
              ...error.response!,
              data: {
                ...errorData,
                parsedValidationErrors: this.parseValidationErrors(errorData.error.details)
              }
            }
          };
          return Promise.reject(enhancedError);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Extract user-friendly permission error messages
   */
  private extractPermissionErrorMessage(errorData?: ApiError): string {
    if (errorData?.error?.message) {
      return errorData.error.message;
    }

    if (errorData?.error?.code === 'FORBIDDEN') {
      return 'Acesso negado. Não tem permissões para realizar esta operação.';
    }

    if (errorData?.error?.code === 'ACCOUNT_DISABLED') {
      return 'Conta desativada. Contacte o administrador.';
    }

    return 'Acesso negado. Permissões insuficientes.';
  }

  /**
   * Extract rate limit messages
   */
  private extractRateLimitMessage(errorData?: ApiError): string {
    if (errorData?.error?.message) {
      return errorData.error.message;
    }

    return 'Limite de requisições excedido. Tente novamente em alguns minutos.';
  }

  /**
   * Parse validation errors into a more usable format
   */
  private parseValidationErrors(details: any[]): Array<{ field: string; message: string }> {
    if (!Array.isArray(details)) {
      return [];
    }

    return details.map(detail => ({
      field: detail.campo || detail.field || 'unknown',
      message: detail.mensagem || detail.message || 'Erro de validação'
    }));
  }

  /**
   * Check if an error is retryable (non-auth, non-validation errors)
   */
  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;

    // Don't retry auth errors, client errors (400-499), or rate limit errors
    if (status && (status >= 400 && status < 500)) {
      return false;
    }

    // Don't retry on network timeout
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      return false;
    }

    // Retry server errors (500+) and network errors
    return !status || status >= 500;
  }

  /**
   * Retry logic for failed requests (excluding auth/validation errors)
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on non-retryable errors
        if (!this.isRetryableError(error as AxiosError)) {
          throw error;
        }

        // Don't delay on the last attempt
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
    });
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
    });
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
    });
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
    });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
    });
  }

  public async upload<T>(url: string, formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<T> {
    // Don't retry file uploads to avoid duplicate uploads
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async postFormData<T>(url: string, formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<T> {
    // Don't retry file uploads to avoid duplicate uploads
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async putFormData<T>(url: string, formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<T> {
    // Don't retry file uploads to avoid duplicate uploads
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiService = new ApiService();

export default ApiService;
