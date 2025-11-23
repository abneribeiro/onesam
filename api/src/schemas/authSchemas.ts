import { z } from 'zod';

const perfilEnum = z.enum(['admin', 'formando']);

const passwordValidation = z
  .string()
  .min(8, 'Palavra-passe deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Palavra-passe deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Palavra-passe deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Palavra-passe deve conter pelo menos um número');

export const registarSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    palavrapasse: passwordValidation,
    perfil: perfilEnum,
    avatar: z.string().optional(),
    // Campos específicos de formando (opcionais)
    empresa: z.string().optional(),
    cargo: z.string().optional(),
    areaInteresse: z.string().optional(),
    objetivosAprendizagem: z.string().optional(),
  }),
});

export const autenticarSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    palavrapasse: z.string().min(1, 'Palavra-passe é obrigatória'),
  }),
});

export const pedirRecuperacaoSenhaSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  }),
});

export const recuperarSenhaSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    novaSenha: passwordValidation,
  }),
});
