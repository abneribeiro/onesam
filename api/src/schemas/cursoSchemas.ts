import { z } from 'zod';

const nivelEnum = z.enum(['iniciante', 'intermedio', 'avancado']);

export const createCursoSchema = z.object({
  body: z
    .object({
      nome: z.string().min(3, 'Nome é obrigatório'),
      descricao: z.string().optional(),
      dataInicio: z.string().datetime('Data de início inválida'),
      dataFim: z.string().datetime('Data de fim inválida'),
      IDArea: z.number().int().positive('ID de área inválido'),
      IDCategoria: z.number().int().positive('ID de categoria inválido'),
      nivel: nivelEnum.optional(),
      limiteVagas: z.number().int().positive('Limite de vagas deve ser pelo menos 1').optional().nullable(),
      dataLimiteInscricao: z.string().datetime('Data limite de inscrição inválida').optional().nullable(),
    })
    .refine(
      (data) => {
        const inicio = new Date(data.dataInicio);
        const fim = new Date(data.dataFim);
        return fim > inicio;
      },
      {
        message: 'Data de fim deve ser posterior à data de início',
        path: ['dataFim'],
      }
    ),
});

export const updateCursoSchema = z.object({
  body: z
    .object({
      nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
      descricao: z.string().optional(),
      dataInicio: z.string().datetime('Data inválida').optional(),
      dataFim: z.string().datetime('Data inválida').optional(),
      dataLimiteInscricao: z.string().datetime('Data inválida').optional().nullable(),
      IDArea: z.number().int().positive('ID de área inválido').optional(),
      IDCategoria: z.number().int().positive('ID de categoria inválido').optional(),
      limiteVagas: z.number().int().min(1, 'Limite de vagas deve ser pelo menos 1').optional().nullable(),
      nivel: nivelEnum.optional(),
    })
    .refine(
      (data) => {
        if (data.dataInicio && data.dataFim) {
          const inicio = new Date(data.dataInicio);
          const fim = new Date(data.dataFim);
          return fim > inicio;
        }
        return true;
      },
      {
        message: 'Data de fim deve ser posterior à data de início',
        path: ['dataFim'],
      }
    ),
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getCursoSchema = z.object({
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const reativarCursoSchema = z.object({
  body: z
    .object({
      dataInicio: z.string().datetime('Nova data de início é obrigatória'),
      dataFim: z.string().datetime('Nova data de fim é obrigatória'),
    })
    .refine(
      (data) => {
        const inicio = new Date(data.dataInicio);
        const fim = new Date(data.dataFim);
        return fim > inicio;
      },
      {
        message: 'Data de fim deve ser após a data de início',
        path: ['dataFim'],
      }
    ),
  params: z.object({
    IDCurso: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});
