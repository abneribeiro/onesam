import { z } from 'zod';

/**
 * Schema for admin statistics query parameters
 */
export const adminStatsSchema = z.object({
  query: z.object({
    periodo: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  }).optional(),
});

/**
 * Schema for popular courses query parameters
 */
export const cursosMaisPopularesSchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().min(1).max(50))
      .optional()
      .default(5),
  }).optional(),
});

/**
 * Schema for analytics KPIs
 */
export const analyticsKPIsSchema = z.object({
  query: z.object({
    periodo: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  }).optional(),
});

/**
 * Schema for monthly completions analytics
 */
export const conclusoesMensaisSchema = z.object({
  query: z.object({
    ano: z.string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().min(2020).max(new Date().getFullYear() + 1))
      .optional()
      .default(new Date().getFullYear()),
    meses: z.string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().min(1).max(12))
      .optional()
      .default(12),
  }).optional(),
});

/**
 * Schema for course analytics
 */
export const analyticsCursosSchema = z.object({
  query: z.object({
    periodo: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
    categoria: z.string().optional(),
    area: z.string().optional(),
  }).optional(),
});

/**
 * Schema for CSV export
 */
export const exportarCSVSchema = z.object({
  query: z.object({
    tipo: z.enum(['inscricoes', 'utilizadores', 'cursos', 'completo']).optional().default('inscricoes'),
    dataInicio: z.string().datetime().optional(),
    dataFim: z.string().datetime().optional(),
    formato: z.enum(['csv', 'xlsx']).optional().default('csv'),
  }).optional(),
});