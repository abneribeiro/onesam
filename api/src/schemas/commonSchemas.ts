import { z } from 'zod';

/**
 * Common validation schemas used across multiple routes
 * These schemas ensure consistent validation patterns throughout the API
 */

/**
 * Validates numeric ID parameters from URL path
 * Ensures IDs are positive integers in string format
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});

/**
 * Validates multiple numeric IDs in array format
 * Used for bulk operations like bulk delete
 */
export const idsParamSchema = z.object({
  ids: z.array(z.number().int().positive('ID deve ser um número positivo')),
});

/**
 * Validates pagination parameters from query string
 * Provides sensible defaults and limits
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((val) => val >= 1, 'Page deve ser pelo menos 1'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((val) => val >= 1 && val <= 100, 'Limit deve estar entre 1 e 100'),
});

/**
 * Validates sorting parameters from query string
 * Ensures safe field names and valid directions
 */
export const sortingSchema = z.object({
  sortBy: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Campo de ordenação inválido')
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'], { message: 'Direção deve ser "asc" ou "desc"' })
    .optional()
    .default('asc'),
});

/**
 * Validates search/filter parameters
 * Used for text-based filtering across entities
 */
export const searchSchema = z.object({
  search: z
    .string()
    .max(255, 'Termo de busca muito longo')
    .optional(),
  ativo: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

/**
 * Validates boolean toggle operations
 * Used for activate/deactivate functionality
 */
export const toggleSchema = z.object({
  ativo: z.boolean(),
});

/**
 * Validates bulk operation requests
 * Ensures arrays are not empty and contain valid IDs
 */
export const bulkOperationSchema = z.object({
  ids: z
    .array(z.number().int().positive('ID deve ser um número positivo'))
    .min(1, 'Pelo menos um ID é obrigatório')
    .max(50, 'Máximo de 50 itens por operação bulk'),
});

/**
 * Validates file upload parameters
 * Used for image and document uploads
 */
export const fileUploadSchema = z.object({
  tipo: z.enum(['imagem', 'documento', 'video'], { message: 'Tipo de arquivo inválido' }),
  tamanhoMaximo: z.number().int().positive().optional(),
});

/**
 * Validates date range parameters
 * Ensures start date is before end date
 */
export const dateRangeSchema = z
  .object({
    dataInicio: z.string().datetime('Data de início inválida').optional(),
    dataFim: z.string().datetime('Data de fim inválida').optional(),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.dataFim) {
        return new Date(data.dataFim) > new Date(data.dataInicio);
      }
      return true;
    },
    {
      message: 'Data de fim deve ser posterior à data de início',
      path: ['dataFim'],
    }
  );

/**
 * Common response format validation
 * Ensures consistent API response structure
 */
export const apiResponseSchema = z.object({
  sucesso: z.boolean(),
  dados: z.any().optional(),
  mensagem: z.string().optional(),
  erro: z.string().optional(),
  timestamp: z.string().datetime(),
});

/**
 * Validates notification settings
 * Used for user notification preferences
 */
export const notificationSchema = z.object({
  tipo: z.enum(['inscricao', 'curso', 'sistema', 'certificado']),
  lida: z.boolean().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional().default('media'),
});

/**
 * Composite schema combining common query parameters
 * Used by routes that need pagination, sorting, and search
 */
export const listQuerySchema = paginationSchema
  .merge(sortingSchema)
  .merge(searchSchema);