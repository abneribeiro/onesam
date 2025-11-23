import { z } from 'zod';

export const createAreaSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    descricao: z.string().optional(),
  }),
});

export const updateAreaSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
    descricao: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getAreaSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});
