/**
 * Tipos específicos do Frontend
 * Para tipos compartilhados com backend, importar de .w/api.types
 */

// Importar tipos necessários para uso local
import type {
  Utilizador,
  RegisterInput,
  Notificacao,
  TipoPerfil,
  CursoFiltros,
} from './api.types';

// Re-exportar todos os tipos da API
export * from './api.types';

// Tipos adicionais específicos do frontend

// Context Types
export interface AuthContextType {
  currentUser: Utilizador | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialCheckDone: boolean;
  login: (email: string, password: string) => Promise<Utilizador>;
  logout: () => Promise<void>;
  register: (data: RegisterInput) => Promise<Utilizador>;
  refreshUserData: () => Promise<void>;
}

export interface NotificationContextType {
  notifications: Notificacao[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState<T> extends LoadingState {
  data: T;
  isDirty: boolean;
  isValid: boolean;
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiredRoles?: TipoPerfil[];
  requireAuth?: boolean;
}

// Pagination Types
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Error Types
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Upload Types
export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

// Filter State Types
export interface CursoFilterState extends CursoFiltros {
  search?: string;
  formadorId?: number;
  page?: number;
  pageSize?: number;
}
