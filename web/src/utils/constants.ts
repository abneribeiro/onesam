/**
 * Constantes da aplicação
 */

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const;

// Validações de formulário
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_CURSO_NOME_LENGTH: 5,
  MAX_CURSO_NOME_LENGTH: 200,
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Não tem permissão para aceder este recurso.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Por favor, verifique os dados inseridos.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_EMAIL: 'Email inválido.',
  INVALID_PASSWORD: 'A senha deve ter no mínimo 8 caracteres (maiúscula, minúscula, número).',
  PASSWORDS_DONT_MATCH: 'As senhas não coincidem.',
  FILE_TOO_LARGE: 'O ficheiro é muito grande.',
  INVALID_FILE_TYPE: 'Tipo de ficheiro inválido.',
} as const;

// Mensagens de sucesso padrão
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login realizado com sucesso!',
  LOGOUT: 'Logout realizado com sucesso!',
  REGISTER: 'Registo realizado com sucesso!',
  CREATED: 'Criado com sucesso!',
  UPDATED: 'Atualizado com sucesso!',
  DELETED: 'Removido com sucesso!',
  UPLOADED: 'Upload realizado com sucesso!',
} as const;

// Debounce delays (em ms)
export const DEBOUNCE = {
  SEARCH: 300,
  AUTOSAVE: 1000,
  RESIZE: 150,
} as const;
