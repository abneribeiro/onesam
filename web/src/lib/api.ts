import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private axiosInstance: AxiosInstance;

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

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiError>) => {
        return Promise.reject(error);
      }
    );
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async upload<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async postFormData<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return (response.data.dados !== undefined ? response.data.dados : response.data) as T;
  }

  public async putFormData<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
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
