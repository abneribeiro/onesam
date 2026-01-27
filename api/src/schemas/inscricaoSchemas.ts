import { z } from 'zod';

export const createInscricaoSchema = z.object({
  body: z.object({
    cursoId: z.number().int().positive('ID do curso inválido'), // Padronizado de IDCurso
  }),
});

export const getInscricaoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'), // Padronizado de IDInscricao
  }),
});

export const getInscricoesByCursoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID do curso inválido'), // Padronizado de IDCurso para id
  }),
});

/**
 * Schema para validação de parâmetro ID genérico
 * Usado em rotas como /:id/aprovar, /:id/rejeitar, etc.
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});

/**
 * Schema para validação da rejeição de inscrição
 * O motivo é opcional mas recomendado
 */
export const rejeitarInscricaoSchema = z.object({
  motivo: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
});

/**
 * Schema para validação de cancelamento de inscrição
 */
export const cancelarInscricaoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});
