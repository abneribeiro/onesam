import { z } from 'zod';

const tipoConteudoEnum = z.enum(['video', 'documento', 'link', 'texto', 'quiz']);

// Regex para validação de URLs
const URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const SUPABASE_STORAGE_REGEX = /^https?:\/\/.*\.supabase\.co\/storage\/v1\/object\/(public|sign)\/.+$/;

const isValidVideoUrl = (url: string): boolean => {
  return YOUTUBE_REGEX.test(url) || SUPABASE_STORAGE_REGEX.test(url) || URL_REGEX.test(url);
};

export const createAulaSchema = z.object({
  body: z
    .object({
      titulo: z
        .string()
        .trim()
        .min(1, 'O título é obrigatório')
        .max(255, 'O título deve ter no máximo 255 caracteres'),
      descricao: z.string().optional(),
      tipo: tipoConteudoEnum,
      conteudo: z.string().optional(), // Para tipo 'texto'
      url: z.string().optional(), // Para tipos 'video', 'link', 'documento'
      duracao: z.number().int().positive('A duração deve ser um número positivo').optional(),
      ordem: z.number().int().nonnegative('A ordem deve ser um número inteiro positivo').optional(),
      obrigatoria: z.boolean().optional(),
      IDModulo: z.number().int().positive('ID do módulo deve ser um número válido'),
    })
    .refine(
      (data) => {
        // URL é obrigatória para tipos 'link', 'video' e 'documento'
        if (['link', 'video', 'documento'].includes(data.tipo) && !data.url) {
          return false;
        }
        return true;
      },
      {
        message: 'URL é obrigatória para conteúdos do tipo link, vídeo ou documento',
        path: ['url'],
      }
    )
    .refine(
      (data) => {
        // Conteúdo é obrigatório para tipo 'texto'
        if (data.tipo === 'texto' && !data.conteudo) {
          return false;
        }
        return true;
      },
      {
        message: 'Conteúdo é obrigatório para aulas do tipo texto',
        path: ['conteudo'],
      }
    )
    .refine(
      (data) => {
        // Validar URL para tipo 'video' (YouTube, Supabase ou URL válida)
        if (data.tipo === 'video' && data.url && !isValidVideoUrl(data.url)) {
          return false;
        }
        return true;
      },
      {
        message: 'A URL deve ser uma URL de vídeo válida (YouTube ou hospedado)',
        path: ['url'],
      }
    )
    .refine(
      (data) => {
        // Validar formato de URL para tipo 'link'
        if (data.tipo === 'link' && data.url && !URL_REGEX.test(data.url)) {
          return false;
        }
        return true;
      },
      {
        message: 'URL inválida',
        path: ['url'],
      }
    ),
});

export const updateAulaSchema = z.object({
  body: z
    .object({
      titulo: z
        .string()
        .trim()
        .min(1, 'O título é obrigatório')
        .max(255, 'O título deve ter no máximo 255 caracteres')
        .optional(),
      descricao: z.string().optional(),
      tipo: tipoConteudoEnum.optional(),
      conteudo: z.string().optional(),
      url: z.string().optional(),
      duracao: z.number().int().positive('A duração deve ser um número positivo').optional(),
      ordem: z.number().int().nonnegative('A ordem deve ser um número inteiro positivo').optional(),
      obrigatoria: z.boolean().optional(),
    })
    .refine(
      (data) => {
        if (data.tipo === 'video' && data.url && !isValidVideoUrl(data.url)) {
          return false;
        }
        return true;
      },
      {
        message: 'A URL deve ser uma URL de vídeo válida (YouTube ou hospedado)',
        path: ['url'],
      }
    )
    .refine(
      (data) => {
        if (data.tipo === 'link' && data.url && !URL_REGEX.test(data.url)) {
          return false;
        }
        return true;
      },
      {
        message: 'URL inválida',
        path: ['url'],
      }
    ),
  params: z.object({
    IDAula: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const getAulaSchema = z.object({
  params: z.object({
    IDAula: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const deleteAulaSchema = z.object({
  params: z.object({
    IDAula: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

export const listAulasByModuloSchema = z.object({
  params: z.object({
    IDModulo: z.string().regex(/^\d+$/, 'ID do módulo inválido'),
  }),
});

export const marcarAulaConcluidaSchema = z.object({
  body: z.object({
    tempoGasto: z.number().int().nonnegative('O tempo gasto deve ser um número positivo').optional(),
  }),
  params: z.object({
    IDAula: z.string().regex(/^\d+$/, 'ID da aula inválido'),
  }),
});
