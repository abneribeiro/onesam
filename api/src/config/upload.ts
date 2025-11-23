/**
 * Configurações centralizadas para upload de arquivos
 * Evita magic numbers e permite configuração via variáveis de ambiente
 */

// Converte MB para bytes
const mbToBytes = (mb: number): number => mb * 1024 * 1024;

export const UPLOAD_LIMITS = {
  /** Tamanho máximo para avatars de usuário (padrão: 5MB) */
  AVATAR_MAX_SIZE: mbToBytes(
    parseInt(process.env.AVATAR_MAX_SIZE_MB || '5', 10)
  ),

  /** Tamanho máximo para imagens de curso (padrão: 10MB) */
  COURSE_IMAGE_MAX_SIZE: mbToBytes(
    parseInt(process.env.COURSE_IMAGE_MAX_SIZE_MB || '10', 10)
  ),

  /** Tamanho máximo para vídeos de aulas (padrão: 50MB) */
  VIDEO_MAX_SIZE: mbToBytes(
    parseInt(process.env.VIDEO_MAX_SIZE_MB || '50', 10)
  ),

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
