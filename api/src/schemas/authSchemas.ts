import { z } from 'zod';
import { sanitizeText, sanitizeEmail } from '../utils/sanitize';

const perfilEnum = z.enum(['admin', 'formando']);

// Custom sanitizing string transformers
const sanitizedString = z.string().transform((val) => sanitizeText(val));
const sanitizedEmail = z.string().transform((val) => {
  const sanitized = sanitizeEmail(val);
  if (!sanitized) throw new Error('Email inválido');
  return sanitized;
});

const passwordValidation = z
  .string()
  .min(8, 'Palavra-passe deve ter pelo menos 8 caracteres')
  .max(128, 'Palavra-passe muito longa')
  .regex(/[A-Z]/, 'Palavra-passe deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Palavra-passe deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Palavra-passe deve conter pelo menos um número');

export const registarSchema = z.object({
  body: z.object({
    nome: sanitizedString.min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
    email: sanitizedEmail,
    palavrapasse: passwordValidation,
    perfil: perfilEnum,
    avatar: z.string().url('URL de avatar inválida').optional(),
    // Campos específicos de formando (opcionais)
    empresa: sanitizedString.max(255, 'Nome da empresa muito longo').optional(),
    cargo: sanitizedString.max(255, 'Nome do cargo muito longo').optional(),
    areaInteresse: sanitizedString.max(500, 'Área de interesse muito longa').optional(),
    objetivosAprendizagem: sanitizedString.max(1000, 'Objetivos de aprendizagem muito longos').optional(),
  }),
});

export const autenticarSchema = z.object({
  body: z.object({
    email: sanitizedEmail,
    palavrapasse: z.string().min(1, 'Palavra-passe é obrigatória').max(128, 'Palavra-passe muito longa'),
  }),
});

export const pedirRecuperacaoSenhaSchema = z.object({
  body: z.object({
    email: sanitizedEmail,
  }),
});

export const recuperarSenhaSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    novaSenha: passwordValidation,
  }),
});
