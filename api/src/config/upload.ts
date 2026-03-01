/**
 * Configurações centralizadas para upload de arquivos
 * Evita magic numbers e permite configuração via variáveis de ambiente
 */

import config from './environment';

// Converte MB para bytes
const mbToBytes = (mb: number): number => mb * 1024 * 1024;

// Função para validar e converter tamanhos de ambiente
const getUploadSizeFromEnv = (envVar: string | undefined, defaultMB: number): number => {
  if (!envVar) return mbToBytes(defaultMB);

  const parsed = parseInt(envVar, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(`Invalid ${envVar} value, using default ${defaultMB}MB`);
    return mbToBytes(defaultMB);
  }

  return mbToBytes(parsed);
};

export const UPLOAD_LIMITS = {
  /** Tamanho máximo para avatars de usuário (padrão: 5MB) */
  AVATAR_MAX_SIZE: getUploadSizeFromEnv(process.env.AVATAR_MAX_SIZE_MB, 5),

  /** Tamanho máximo para imagens de curso (padrão: 10MB) */
  COURSE_IMAGE_MAX_SIZE: getUploadSizeFromEnv(process.env.COURSE_IMAGE_MAX_SIZE_MB, 10),

  /** Tamanho máximo para vídeos de aulas (padrão: 50MB) */
  VIDEO_MAX_SIZE: getUploadSizeFromEnv(process.env.VIDEO_MAX_SIZE_MB, 50),

  /** Tamanho máximo geral de arquivo (do config validado) */
  MAX_FILE_SIZE: config.upload.maxFileSize,

  /** Tipos de imagem permitidos para avatars */
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const,

  /** Tipos de imagem permitidos para cursos */
  COURSE_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,

  /** Tipos de vídeo permitidos para aulas */
  VIDEO_ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'] as const,
} as const;

/** Tipo para tipos MIME permitidos */
export type AllowedMimeType = typeof UPLOAD_LIMITS.AVATAR_ALLOWED_TYPES[number];

/** Tipo para tipos de vídeo permitidos */
export type AllowedVideoMimeType = typeof UPLOAD_LIMITS.VIDEO_ALLOWED_TYPES[number];
