import { z } from 'zod';

export const atualizarPerfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'O nome deve ter entre 2 e 255 caracteres')
    .max(255, 'O nome deve ter entre 2 e 255 caracteres')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Digite um email válido')
    .optional(),
  localizacao: z
    .string()
    .max(255, 'A localização deve ter no máximo 255 caracteres')
    .optional(),
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
