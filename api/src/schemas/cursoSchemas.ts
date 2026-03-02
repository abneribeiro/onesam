import { z } from 'zod';
import { sanitizeText, sanitizeHtml } from '../utils/sanitize';

const nivelEnum = z.enum(['iniciante', 'intermedio', 'avancado']);
const estadoEnum = z.enum(['planeado', 'em_curso', 'terminado', 'arquivado']);

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
      estado: estadoEnum.optional(),
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
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getCursoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
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
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for changing course state
export const alterarEstadoSchema = z.object({
  body: z.object({
    estado: estadoEnum,
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for deleting a course
export const deletarCursoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for bulk deleting courses
export const deletarCursosEmMassaSchema = z.object({
  body: z.object({
    ids: z
      .array(z.number().int().positive('ID deve ser um número positivo'))
      .min(1, 'Pelo menos um ID é obrigatório')
      .max(50, 'Máximo de 50 cursos por operação'),
  }),
});

// Schema for listing courses query parameters
export const listarCursosQuerySchema = z.object({
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
    .refine((val) => val >= 1 && val <= 100, 'Limite deve estar entre 1 e 100'),
  search: z.string().max(255, 'Termo de busca muito longo').optional(),
  areaId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined)
    .refine((val) => val === undefined || val > 0, 'ID de área inválido'),
  categoriaId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined)
    .refine((val) => val === undefined || val > 0, 'ID de categoria inválido'),
  nivel: nivelEnum.optional(),
  estado: estadoEnum.optional(),
  visivel: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  sortBy: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Campo de ordenação inválido')
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'], { message: 'Direção deve ser "asc" ou "desc"' })
    .optional()
    .default('asc'),
});

// Schema for listing courses with filters
export const listarCursosSchema = z.object({
  query: listarCursosQuerySchema,
});
