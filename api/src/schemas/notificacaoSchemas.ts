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

// Schema for listing notifications with pagination and filters
export const listarNotificacoesSchema = z.object({
  query: z.object({
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
      .datetime('Data de início inválida')
      .optional(),
    dataFim: z
      .string()
      .datetime('Data de fim inválida')
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
  ),
});

// Schema for marking notification as read
export const marcarComoLidaSchema = notificacaoIdParamSchema;

// Schema for deleting notification
export const deletarNotificacaoSchema = notificacaoIdParamSchema;

// Schema for marking all notifications as read (no parameters needed)
export const marcarTodasComoLidasSchema = z.object({});

// Schema for counting unread notifications (no parameters needed)
export const contarNotificacoesNaoLidasSchema = z.object({});

// Schema for listing unread notifications with pagination
export const listarNotificacoesNaoLidasSchema = z.object({
  query: z.object({
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
  }),
});