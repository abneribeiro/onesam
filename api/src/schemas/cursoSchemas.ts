import { z } from 'zod';
import { sanitizeText, sanitizeHtml } from '../utils/sanitize';

const nivelEnum = z.enum(['iniciante', 'intermedio', 'avancado']);

// Custom sanitizing string transformers
const sanitizedString = (minLength?: number) =>
  z.string()
    .min(minLength || 0)
    .transform((val) => sanitizeText(val));

const sanitizedHtmlString = () =>
  z.string()
    .transform((val) => sanitizeHtml(val));

export const createCursoSchema = z.object({
  body: z
    .object({
      nome: sanitizedString(3),
      descricao: sanitizedHtmlString().optional(),
      dataInicio: z.string().datetime('Data de início inválida'),
      dataFim: z.string().datetime('Data de fim inválida'),
      areaId: z.number().int().positive('ID de área inválido'), // Padronizado de IDArea
      categoriaId: z.number().int().positive('ID de categoria inválido'), // Padronizado de IDCategoria
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
      nome: sanitizedString(3).optional(),
      descricao: sanitizedHtmlString().optional(),
      dataInicio: z.string().datetime('Data inválida').optional(),
      dataFim: z.string().datetime('Data inválida').optional(),
      dataLimiteInscricao: z.string().datetime('Data inválida').optional().nullable(),
      areaId: z.number().int().positive('ID de área inválido').optional(), // Padronizado
      categoriaId: z.number().int().positive('ID de categoria inválido').optional(), // Padronizado
      nivel: nivelEnum.optional(),
      limiteVagas: z.number().int().positive('Limite de vagas deve ser pelo menos 1').optional().nullable(),
      certificado: z.boolean().optional(),
      visivel: z.boolean().optional(),
      estado: z.enum(['planeado', 'em_curso', 'terminado', 'arquivado']).optional(),
      cargaHoraria: z.number().int().positive('Carga horária inválida').optional().nullable(),
      notaMinimaAprovacao: z.number().int().min(0, 'Nota deve ser pelo menos 0').max(20, 'Nota deve ser no máximo 20').optional(),
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
