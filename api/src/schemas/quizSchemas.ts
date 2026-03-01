import { z } from 'zod';
import { sanitizeText } from '../utils/sanitize';

// Sanitized string transformer for quiz content
const sanitizedString = (minLength: number = 1, maxLength: number = 1000) =>
  z.string()
    .trim()
    .min(minLength, `Mínimo de ${minLength} caracteres`)
    .max(maxLength, `Máximo de ${maxLength} caracteres`)
    .transform((val) => sanitizeText(val));

// Schema for quiz question creation
const createQuizPerguntaSchema = z.object({
  pergunta: sanitizedString(5, 500),
  opcoes: z
    .array(sanitizedString(1, 200))
    .min(2, 'Pergunta deve ter pelo menos 2 opções')
    .max(6, 'Pergunta deve ter no máximo 6 opções'),
  respostaCorreta: z
    .number()
    .int()
    .min(0, 'Resposta correta deve ser pelo menos 0'),
  ordem: z
    .number()
    .int()
    .min(1, 'Ordem deve ser pelo menos 1')
    .optional(),
})
.refine(
  (data) => data.respostaCorreta < data.opcoes.length,
  {
    message: 'Resposta correta deve ser um índice válido das opções',
    path: ['respostaCorreta'],
  }
);

// Schema for creating a quiz
export const createQuizSchema = z.object({
  body: z.object({
    aulaId: z.number().int().positive('ID da aula deve ser um número positivo'),
    titulo: sanitizedString(3, 255),
    notaMinima: z
      .number()
      .min(0, 'Nota mínima deve ser pelo menos 0')
      .max(20, 'Nota mínima deve ser no máximo 20')
      .optional(),
    maxTentativas: z
      .number()
      .int()
      .min(1, 'Máximo de tentativas deve ser pelo menos 1')
      .max(10, 'Máximo de tentativas deve ser no máximo 10')
      .optional(),
    perguntas: z
      .array(createQuizPerguntaSchema)
      .min(1, 'Quiz deve ter pelo menos 1 pergunta')
      .max(50, 'Quiz deve ter no máximo 50 perguntas'),
  }),
});

// Schema for updating a quiz
export const updateQuizSchema = z.object({
  body: z.object({
    aulaId: z.number().int().positive('ID da aula deve ser um número positivo').optional(),
    titulo: sanitizedString(3, 255).optional(),
    notaMinima: z
      .number()
      .min(0, 'Nota mínima deve ser pelo menos 0')
      .max(20, 'Nota mínima deve ser no máximo 20')
      .optional(),
    maxTentativas: z
      .number()
      .int()
      .min(1, 'Máximo de tentativas deve ser pelo menos 1')
      .max(10, 'Máximo de tentativas deve ser no máximo 10')
      .optional(),
    perguntas: z
      .array(createQuizPerguntaSchema)
      .min(1, 'Quiz deve ter pelo menos 1 pergunta')
      .max(50, 'Quiz deve ter no máximo 50 perguntas')
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for quiz submission (student answering)
export const submitQuizSchema = z.object({
  body: z.object({
    respostas: z
      .array(
        z.object({
          perguntaId: z.number().int().positive('ID da pergunta deve ser um número positivo'),
          respostaSelecionada: z
            .number()
            .int()
            .min(0, 'Resposta selecionada deve ser pelo menos 0'),
        })
      )
      .min(1, 'Pelo menos uma resposta é obrigatória')
      .max(50, 'Máximo de 50 respostas por submissão'),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for getting quiz by ID
export const getQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for getting quizzes by lesson
export const getQuizzesByLessonSchema = z.object({
  params: z.object({
    aulaId: z.string().regex(/^\d+$/, 'ID da aula inválido'),
  }),
});

// Schema for checking retry permissions
export const checkRetrySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});

// Schema for getting quiz attempts
export const getAttemptsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
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
  }),
});