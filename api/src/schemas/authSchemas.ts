import { z } from 'zod';
import { sanitizeText, sanitizeEmail } from '../utils/sanitize';

const perfilEnum = z.enum(['admin', 'formando']);

// Custom sanitizing string transformers
const sanitizedString = (minLength?: number, maxLength?: number) =>
  z.string()
    .min(minLength || 0)
    .max(maxLength || 1000)
    .transform((val) => sanitizeText(val));

const sanitizedEmail = () =>
  z.string()
    .email('Email inválido')
    .transform((val) => {
      const sanitized = sanitizeEmail(val);
      if (!sanitized) throw new Error('Email inválido');
      return sanitized;
    });

const passwordValidation = z
  .string()
  .min(8, 'Password deve ter pelo menos 8 caracteres')
  .max(128, 'Password muito longa')
  .regex(/[A-Z]/, 'Password deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Password deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Password deve conter pelo menos um número');

// Better Auth Compatible Schemas - Corrigidos
export const registarSchema = z.object({
  body: z.object({
    nome: sanitizedString(1, 255).refine((val) => val.length >= 1, { message: 'Nome é obrigatório' }),
    email: sanitizedEmail(),
    password: passwordValidation, // Mudado de 'palavrapasse' para 'password'
    tipoPerfil: perfilEnum, // Mudado de 'perfil' para 'tipoPerfil' para compatibilidade
    avatar: z.string().url('URL de avatar inválida').optional(),
    // Campos específicos de formando (opcionais)
    empresa: sanitizedString(0, 255).optional(),
    cargo: sanitizedString(0, 255).optional(),
    areaInteresse: sanitizedString(0, 500).optional(),
    objetivosAprendizagem: sanitizedString(0, 1000).optional(),
  }),
});

export const autenticarSchema = z.object({
  body: z.object({
    email: sanitizedEmail(),
    password: z.string().min(1, 'Password é obrigatória').max(128, 'Password muito longa'), // Mudado de 'palavrapasse'
  }),
});

export const pedirRecuperacaoSenhaSchema = z.object({
  body: z.object({
    email: sanitizedEmail(),
  }),
});

export const recuperarSenhaSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordValidation, // Mudado de 'novaSenha' para 'password'
  }),
});

// Legacy schemas mantidos para compatibilidade (DEPRECATED)
export const registarSchemaLegacy = z.object({
  body: z.object({
    nome: sanitizedString(1, 255),
    email: sanitizedEmail(),
    palavrapasse: passwordValidation,
    perfil: perfilEnum,
    avatar: z.string().url().optional(),
    empresa: sanitizedString(0, 255).optional(),
    cargo: sanitizedString(0, 255).optional(),
    areaInteresse: sanitizedString(0, 500).optional(),
    objetivosAprendizagem: sanitizedString(0, 1000).optional(),
  }),
});

export const autenticarSchemaLegacy = z.object({
  body: z.object({
    email: sanitizedEmail(),
    palavrapasse: z.string().min(1, 'Palavra-passe é obrigatória').max(128, 'Palavra-passe muito longa'),
  }),
});
