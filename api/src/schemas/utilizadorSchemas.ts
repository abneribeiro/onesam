import { z } from 'zod';
import { sanitizeText } from '../utils/sanitize';

// Sanitized string transformer for user inputs
const sanitizedString = (minLength?: number, maxLength?: number) =>
  z.string()
    .trim()
    .min(minLength || 0)
    .max(maxLength || 255)
    .transform((val) => sanitizeText(val));

// Valid user types
const tipoPerfilEnum = z.enum(['admin', 'formando'], {
  errorMap: () => ({ message: 'Tipo de perfil deve ser "admin" ou "formando"' })
});

export const atualizarPerfilSchema = z.object({
  nome: sanitizedString(2, 255).optional(),
  email: z
    .string()
    .trim()
    .email('Digite um email válido')
    .optional(),
  localizacao: sanitizedString(0, 255).optional(),
});

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'A senha atual é obrigatória'),
    novaSenha: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A nova senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A nova senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A nova senha deve conter pelo menos um número'),
  })
  .refine((data) => data.senhaAtual !== data.novaSenha, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['novaSenha'],
  });

// Schema for creating new users (admin only)
export const criarUtilizadorSchema = z.object({
  body: z.object({
    nome: sanitizedString(2, 255),
    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(255, 'Email muito longo'),
    senha: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
    tipoPerfil: tipoPerfilEnum,
    ativo: z.boolean().optional().default(true),
    localizacao: sanitizedString(0, 255).optional(),
  }),
});

// Schema for admin updating other users
export const atualizarUtilizadorAdminSchema = z.object({
  body: z.object({
    nome: sanitizedString(2, 255).optional(),
    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(255, 'Email muito longo')
      .optional(),
    senha: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
      .optional(),
    tipoPerfil: tipoPerfilEnum.optional(),
    ativo: z.boolean().optional(),
    localizacao: sanitizedString(0, 255).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for toggling user active status
export const toggleAtivoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for bulk delete operations
export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z
      .array(z.number().int().positive('ID deve ser um número positivo'))
      .min(1, 'Pelo menos um ID é obrigatório')
      .max(50, 'Máximo de 50 utilizadores por operação'),
  }),
});

// Schema for getting user by ID
export const obterUtilizadorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for listing users with query parameters
export const listarUtilizadoresSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => val ? Number(val) : undefined)
      .refine((val) => val === undefined || (val >= 1), 'Página deve ser pelo menos 1'),
    limit: z
      .string()
      .optional()
      .transform((val) => val ? Number(val) : undefined)
      .refine((val) => val === undefined || (val >= 1 && val <= 100), 'Limite deve estar entre 1 e 100'),
    sortBy: z
      .string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Campo de ordenação inválido')
      .optional(),
    sortOrder: z
      .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Ordem deve ser "asc" ou "desc"' })
      })
      .optional(),
    busca: z.string().max(255, 'Termo de busca muito longo').optional(),
    tipoPerfil: tipoPerfilEnum.optional(),
    ativo: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
  }),
});
