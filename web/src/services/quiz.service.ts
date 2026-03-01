import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type {
  Quiz,
  QuizCompleto,
  CreateQuizInput,
  QuizSubmissao,
  QuizResultado,
  QuizTentativa
} from '../types';

class QuizService {
  /**
   * Cria um novo quiz
   */
  async criarQuiz(data: CreateQuizInput): Promise<Quiz> {
    try {
      return await apiService.post<Quiz>('/quizzes', data);
    } catch (error: unknown) {
      return handleApiError(error, 'criar quiz');
    }
  }

  /**
   * Lista quizzes de uma aula (Admin)
   */
  async listarQuizzesPorAula(aulaId: number): Promise<Quiz[]> {
    try {
      return await apiService.get<Quiz[]>(`/quizzes/aula/${aulaId}`);
    } catch (error: unknown) {
      return handleApiError(error, 'listar quizzes da aula');
    }
  }

  /**
   * Obtém quiz completo (Admin)
   */
  async obterQuiz(id: number): Promise<QuizCompleto> {
    try {
      return await apiService.get<QuizCompleto>(`/quizzes/${id}`);
    } catch (error: unknown) {
      return handleApiError(error, 'obter quiz');
    }
  }

  /**
   * Obtém quiz para resolver (Student)
   */
  async obterQuizParaResolver(id: number): Promise<{
    quiz: Omit<QuizCompleto, 'perguntas'> & {
      perguntas: Array<Omit<QuizCompleto['perguntas'][0], 'respostaCorreta'>>;
    };
    podeReitentar: boolean;
    tentativasRestantes: number;
    melhorNota?: number;
    tentativas: Array<Pick<QuizTentativa, 'id' | 'nota' | 'aprovado' | 'tentativa' | 'dataCriacao'>>;
  }> {
    try {
      return await apiService.get(`/quizzes/${id}/resolver`);
    } catch (error: unknown) {
      return handleApiError(error, 'obter quiz para resolver');
    }
  }

  /**
   * Atualiza um quiz
   */
  async atualizarQuiz(id: number, data: Partial<CreateQuizInput>): Promise<Quiz> {
    try {
      return await apiService.put<Quiz>(`/quizzes/${id}`, data);
    } catch (error: unknown) {
      return handleApiError(error, 'atualizar quiz');
    }
  }

  /**
   * Remove um quiz
   */
  async removerQuiz(id: number): Promise<void> {
    try {
      await apiService.delete(`/quizzes/${id}`);
    } catch (error: unknown) {
      handleApiError(error, 'remover quiz');
    }
  }

  /**
   * Submete um quiz
   */
  async submeterQuiz(id: number, respostas: QuizSubmissao['respostas']): Promise<QuizResultado> {
    try {
      return await apiService.post<QuizResultado>(`/quizzes/${id}/submeter`, { respostas });
    } catch (error: unknown) {
      return handleApiError(error, 'submeter quiz');
    }
  }

  /**
   * Obtém tentativas de um quiz
   */
  async obterTentativasQuiz(id: number): Promise<QuizTentativa[]> {
    try {
      return await apiService.get<QuizTentativa[]>(`/quizzes/${id}/tentativas`);
    } catch (error: unknown) {
      return handleApiError(error, 'obter tentativas do quiz');
    }
  }

  /**
   * Verifica se pode reitentar um quiz
   */
  async verificarPodeReitentar(id: number): Promise<{
    podeReitentar: boolean;
    tentativasRestantes: number;
    melhorNota?: number;
  }> {
    try {
      return await apiService.get(`/quizzes/${id}/pode-reitentar`);
    } catch (error: unknown) {
      return handleApiError(error, 'verificar se pode reitentar quiz');
    }
  }
}

export const quizService = new QuizService();
export default QuizService;