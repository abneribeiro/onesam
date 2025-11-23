import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    IDCurso: z.number().int().positive('ID do curso deve ser um número válido'),
    rating: z.number().int().min(1, 'Rating deve ser no mínimo 1').max(5, 'Rating deve ser no máximo 5'),
    comentario: z.string().max(2000, 'Comentário muito longo (máximo 2000 caracteres)').optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating deve ser no mínimo 1').max(5, 'Rating deve ser no máximo 5').optional(),
    comentario: z.string().max(2000, 'Comentário muito longo (máximo 2000 caracteres)').optional(),
  }),
  params: z.object({
    IDReview: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getReviewSchema = z.object({
  params: z.object({
    IDReview: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    IDReview: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const listReviewsByCursoSchema = z.object({
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID do curso inválido'),
  }),
});

export const getMyReviewSchema = z.object({
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID do curso inválido'),
  }),
});

export const getStatsSchema = z.object({
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID do curso inválido'),
  }),
});
