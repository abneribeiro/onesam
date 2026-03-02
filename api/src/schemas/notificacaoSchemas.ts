import { z } from 'zod';

/**
 * Validation schemas for notification operations
 */

// Schema for notification ID parameter validation
export const notificacaoIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID da notificação inválido'),
  }),
});

// Schema for listing notifications query parameters only
export const listarNotificacoesQuerySchema = z.object({
  pagina: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((val) => val >= 1, 'Página deve ser pelo menos 1'),
  limite: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((val) => val >= 1 && val <= 50, 'Limite deve estar entre 1 e 50'),
  tipo: z
    .enum(['inscricao', 'curso', 'sistema', 'certificado'], { message: 'Tipo de notificação inválido' })
    .optional(),
  lida: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  dataInicio: z
    .string()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val), 'Data de início inválida')
    .optional(),
  dataFim: z
    .string()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val), 'Data de fim inválida')
    .optional(),
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

// Schema for listing notifications with pagination and filters (for body validation)
export const listarNotificacoesSchema = z.object({
  query: listarNotificacoesQuerySchema,
});

// Schema for marking notification as read
export const marcarComoLidaSchema = notificacaoIdParamSchema;

// Schema for deleting notification
export const deletarNotificacaoSchema = notificacaoIdParamSchema;

// Schema for marking all notifications as read (no parameters needed)
export const marcarTodasComoLidasSchema = z.object({
  query: z.object({}).optional(),
});

// Schema for counting unread notifications query parameters only (empty but defined)
export const contarNotificacoesNaoLidasQuerySchema = z.object({});

// Schema for counting unread notifications (for body validation)
export const contarNotificacoesNaoLidasSchema = z.object({
  query: contarNotificacoesNaoLidasQuerySchema,
});

// Schema for listing unread notifications query parameters only
export const listarNotificacoesNaoLidasQuerySchema = z.object({
  pagina: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((val) => val >= 1, 'Página deve ser pelo menos 1'),
  limite: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((val) => val >= 1 && val <= 50, 'Limite deve estar entre 1 e 50'),
  tipo: z
    .enum(['inscricao', 'curso', 'sistema', 'certificado'], { message: 'Tipo de notificação inválido' })
    .optional(),
});

// Schema for listing unread notifications with pagination (for body validation)
export const listarNotificacoesNaoLidasSchema = z.object({
  query: listarNotificacoesNaoLidasQuerySchema,
});