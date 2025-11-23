import { z } from 'zod';

export const createCategoriaSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    descricao: z.string().optional(),
    IDArea: z.number().int().positive('ID de área inválido'),
  }),
});

export const updateCategoriaSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
    descricao: z.string().optional(),
    IDArea: z.number().int().positive('ID de área inválido').optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getCategoriaSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getCategoriasByAreaSchema = z.object({
  params: z.object({
    IDArea: z.string().regex(/^\d+$/, 'ID de área inválido'),
  }),
});
