import { z } from 'zod';

/**
 * Validation schemas for certificate operations
 */

// Schema for validating certificate by code (public route)
export const validarCertificadoSchema = z.object({
  params: z.object({
    codigo: z
      .string()
      .min(8, 'Código do certificado deve ter pelo menos 8 caracteres')
      .max(64, 'Código do certificado muito longo')
      .regex(/^[a-zA-Z0-9]+$/, 'Código deve conter apenas caracteres alfanuméricos'),
  }),
});

// Schema for course ID parameter validation
export const cursoIdParamSchema = z.object({
  params: z.object({
    cursoId: z.string().regex(/^\d+$/, 'ID do curso inválido'),
  }),
});

// Schema for generating certificate
export const gerarCertificadoSchema = cursoIdParamSchema;

// Schema for downloading certificate
export const downloadCertificadoSchema = cursoIdParamSchema;

// Schema for checking certificate eligibility
export const verificarElegibilidadeSchema = cursoIdParamSchema;

// Schema for listing user certificates with pagination
export const listarCertificadosSchema = z.object({
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
    cursoNome: z
      .string()
      .max(255, 'Nome do curso muito longo')
      .optional(),
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