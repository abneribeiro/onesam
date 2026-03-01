import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import { quizService, type CreateQuizDTO } from '../services/quizService';
import { sendData, sendCreated, sendSuccess, sendBadRequest, sendNotFound } from '../utils/responseHelper';
import type { QuizSubmissao } from '../types';

export const criarQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data: CreateQuizDTO = req.body;
    const quiz = await quizService.criarQuiz(data);
    sendCreated(res, 'Quiz criado com sucesso', { quiz });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const listarQuizzesPorAula = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { aulaId } = req.params;
    const quizzes = await quizService.obterQuizzesPorAula(Number(aulaId));
    sendData(res, quizzes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const obterQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quiz = await quizService.obterQuizCompleto(Number(id));

    if (!quiz) {
      sendNotFound(res, 'Quiz não encontrado');
      return;
    }

    sendData(res, quiz);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const obterQuizParaResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quizId = Number(id);
    const utilizadorId = req.utilizador!.id;

    const quiz = await quizService.obterQuizCompleto(quizId);
    if (!quiz) {
      sendNotFound(res, 'Quiz não encontrado');
      return;
    }

    // Check if user can attempt the quiz
    const { podeReitentar, tentativasRestantes, melhorNota } = await quizService.podeReitentar(quizId, utilizadorId);
    const tentativas = await quizService.obterTentativasUtilizador(quizId, utilizadorId);

    // Remove correct answers from questions when sending to student
    const quizParaResolver = {
      ...quiz,
      perguntas: quiz.perguntas.map(pergunta => ({
        id: pergunta.id,
        pergunta: pergunta.pergunta,
        opcoes: pergunta.opcoes,
        ordem: pergunta.ordem
        // Remove respostaCorreta
      }))
    };

    sendData(res, {
      quiz: quizParaResolver,
      podeReitentar,
      tentativasRestantes,
      melhorNota,
      tentativas: tentativas.map(t => ({
        id: t.id,
        nota: t.nota,
        aprovado: t.aprovado,
        tentativa: t.tentativa,
        dataCriacao: t.dataCriacao
      }))
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const atualizarQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: Partial<CreateQuizDTO> = req.body;
    const quiz = await quizService.atualizarQuiz(Number(id), data);
    sendSuccess(res, 200, 'Quiz atualizado com sucesso', { quiz });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const deletarQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await quizService.deletarQuiz(Number(id));
    sendSuccess(res, 200, 'Quiz deletado com sucesso');
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const submeterQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    const submissao: QuizSubmissao = {
      quizId: Number(id),
      respostas: req.body.respostas
    };

    const resultado = await quizService.submeterQuiz(utilizadorId, submissao);
    sendCreated(res, 'Quiz submetido com sucesso', resultado);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const obterTentativasQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    const tentativas = await quizService.obterTentativasUtilizador(Number(id), utilizadorId);
    sendData(res, tentativas);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const verificarPodeReitentar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const utilizadorId = req.utilizador!.id;
    const status = await quizService.podeReitentar(Number(id), utilizadorId);
    sendData(res, status);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};