import { z } from 'zod';

// Flat schema for validating notification ID from route params (used with validateParams)
export const notificacaoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID da notificação inválido'),
});

// Schema for listing notifications query parameters (used with validateQuery)
export const listarNotificacoesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((val) => val >= 1, 'Página deve ser pelo menos 1'),
  limit: z
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

// Schema for counting unread notifications query parameters (empty, used with validateQuery)
export const contarNotificacoesNaoLidasQuerySchema = z.object({});

// Schema for listing unread notifications query parameters (used with validateQuery)
export const listarNotificacoesNaoLidasQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((val) => val >= 1, 'Página deve ser pelo menos 1'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((val) => val >= 1 && val <= 50, 'Limite deve estar entre 1 e 50'),
  tipo: z
    .enum(['inscricao', 'curso', 'sistema', 'certificado'], { message: 'Tipo de notificação inválido' })
    .optional(),
});
