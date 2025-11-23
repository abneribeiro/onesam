import { z } from 'zod';

export const createModuloSchema = z.object({
  body: z.object({
    titulo: z
      .string()
      .trim()
      .min(1, 'O título é obrigatório')
      .max(255, 'O título deve ter no máximo 255 caracteres'),
    descricao: z.string().optional(),
    ordem: z.number().int().nonnegative('A ordem deve ser um número inteiro positivo').optional(),
    IDCurso: z.number().int().positive('ID do curso deve ser um número válido'),
  }),
});

export const updateModuloSchema = z.object({
  body: z.object({
    titulo: z
      .string()
      .trim()
      .min(1, 'O título é obrigatório')
      .max(255, 'O título deve ter no máximo 255 caracteres')
      .optional(),
    descricao: z.string().optional(),
    ordem: z.number().int().nonnegative('A ordem deve ser um número inteiro positivo').optional(),
  }),
  params: z.object({
    IDModulo: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getModuloSchema = z.object({
  params: z.object({
    IDModulo: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const deleteModuloSchema = z.object({
  params: z.object({
    IDModulo: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const listModulosByCursoSchema = z.object({
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID do curso inválido'),
  }),
});
