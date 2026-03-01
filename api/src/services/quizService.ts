import { quizRepository } from '../repositories/quizRepository';
import logger from '../utils/logger';
import type {
  Quiz,
  NewQuiz,
  QuizPergunta,
  NewQuizPergunta,
  QuizTentativa,
  NewQuizTentativa,
  QuizCompleto,
  QuizResposta,
  QuizSubmissao
} from '../types';

export interface CreateQuizDTO {
  aulaId: number;
  titulo: string;
  notaMinima?: number;
  maxTentativas?: number;
  perguntas: CreateQuizPerguntaDTO[];
}

export interface CreateQuizPerguntaDTO {
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  ordem?: number;
}

export interface QuizResultado {
  tentativa: QuizTentativa;
  nota: number;
  aprovado: boolean;
  respostasCorretas: number;
  totalPerguntas: number;
  podeReitentar: boolean;
  tentativasRestantes: number;
}

export class QuizService {
  async criarQuiz(data: CreateQuizDTO): Promise<Quiz> {
    try {
      await this.validarDadosQuiz(data);

      // Create quiz first
      const quizData: NewQuiz = {
        aulaId: data.aulaId,
        titulo: data.titulo,
        notaMinima: data.notaMinima || 10,
        maxTentativas: data.maxTentativas || 3
      };

      const quiz = await quizRepository.create(quizData);

      // Create questions
      for (const [index, pergunta] of data.perguntas.entries()) {
        await this.criarPergunta(quiz.id, {
          ...pergunta,
          ordem: pergunta.ordem ?? index
        });
      }

      return quiz;
    } catch (error) {
      logger.error('Erro ao criar quiz', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async validarDadosQuiz(data: CreateQuizDTO): Promise<void> {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (!data.aulaId) {
      throw new Error('ID da aula é obrigatório');
    }

    if (data.notaMinima && (data.notaMinima < 0 || data.notaMinima > 20)) {
      throw new Error('Nota mínima deve estar entre 0 e 20');
    }

    if (data.maxTentativas && (data.maxTentativas < 1 || data.maxTentativas > 10)) {
      throw new Error('Máximo de tentativas deve estar entre 1 e 10');
    }

    if (!data.perguntas || data.perguntas.length === 0) {
      throw new Error('Quiz deve ter pelo menos uma pergunta');
    }

    if (data.perguntas.length > 50) {
      throw new Error('Quiz pode ter no máximo 50 perguntas');
    }

    // Validate each question
    for (const [index, pergunta] of data.perguntas.entries()) {
      if (!pergunta.pergunta || pergunta.pergunta.trim().length === 0) {
        throw new Error(`Pergunta ${index + 1}: texto é obrigatório`);
      }

      if (!pergunta.opcoes || pergunta.opcoes.length < 2) {
        throw new Error(`Pergunta ${index + 1}: deve ter pelo menos 2 opções`);
      }

      if (pergunta.opcoes.length > 6) {
        throw new Error(`Pergunta ${index + 1}: pode ter no máximo 6 opções`);
      }

      if (pergunta.respostaCorreta < 0 || pergunta.respostaCorreta >= pergunta.opcoes.length) {
        throw new Error(`Pergunta ${index + 1}: resposta correta deve ser um índice válido das opções`);
      }

      for (const [opcaoIndex, opcao] of pergunta.opcoes.entries()) {
        if (!opcao || opcao.trim().length === 0) {
          throw new Error(`Pergunta ${index + 1}, Opção ${opcaoIndex + 1}: texto é obrigatório`);
        }
      }
    }
  }

  private async criarPergunta(quizId: number, data: CreateQuizPerguntaDTO): Promise<QuizPergunta> {
    const perguntaData: NewQuizPergunta = {
      quizId,
      pergunta: data.pergunta.trim(),
      opcoesJson: JSON.stringify(data.opcoes.map(o => o.trim())),
      respostaCorreta: data.respostaCorreta,
      ordem: data.ordem || 0
    };

    return await quizRepository.createPergunta(perguntaData);
  }

  async obterQuiz(quizId: number): Promise<Quiz | undefined> {
    return await quizRepository.findById(quizId);
  }

  async obterQuizCompleto(quizId: number): Promise<QuizCompleto | undefined> {
    return await quizRepository.findCompleto(quizId);
  }

  async obterQuizzesPorAula(aulaId: number): Promise<Quiz[]> {
    return await quizRepository.findByAulaId(aulaId);
  }

  async atualizarQuiz(quizId: number, data: Partial<CreateQuizDTO>): Promise<Quiz> {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    const updateData: Partial<NewQuiz> = {};
    if (data.titulo) updateData.titulo = data.titulo;
    if (data.notaMinima !== undefined) updateData.notaMinima = data.notaMinima;
    if (data.maxTentativas !== undefined) updateData.maxTentativas = data.maxTentativas;

    const quizAtualizado = await quizRepository.update(quizId, updateData);
    if (!quizAtualizado) {
      throw new Error('Erro ao atualizar quiz');
    }

    // Update questions if provided
    if (data.perguntas) {
      await this.validarDadosQuiz({ ...quiz, ...data } as CreateQuizDTO);

      // Delete existing questions and create new ones
      await quizRepository.deletePerguntasByQuizId(quizId);

      for (const [index, pergunta] of data.perguntas.entries()) {
        await this.criarPergunta(quizId, {
          ...pergunta,
          ordem: pergunta.ordem ?? index
        });
      }
    }

    return quizAtualizado;
  }

  async deletarQuiz(quizId: number): Promise<void> {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    await quizRepository.delete(quizId);
  }

  async submeterQuiz(utilizadorId: number, submissao: QuizSubmissao): Promise<QuizResultado> {
    try {
      const quiz = await quizRepository.findCompleto(submissao.quizId);
      if (!quiz) {
        throw new Error('Quiz não encontrado');
      }

      // Check if user can still attempt the quiz
      const tentativasCount = await quizRepository.countTentativasByQuizAndUser(submissao.quizId, utilizadorId);

      if (tentativasCount >= quiz.maxTentativas) {
        throw new Error('Limite de tentativas excedido');
      }

      // Calculate score
      const { nota, respostasCorretas } = this.calcularNota(quiz, submissao.respostas);
      const aprovado = nota >= quiz.notaMinima;

      // Create attempt record
      const tentativaData: NewQuizTentativa = {
        quizId: submissao.quizId,
        utilizadorId,
        respostasJson: JSON.stringify(submissao.respostas),
        nota,
        aprovado,
        tentativa: tentativasCount + 1
      };

      const tentativa = await quizRepository.createTentativa(tentativaData);

      const tentativasRestantes = quiz.maxTentativas - (tentativasCount + 1);
      const podeReitentar = !aprovado && tentativasRestantes > 0;

      return {
        tentativa,
        nota,
        aprovado,
        respostasCorretas,
        totalPerguntas: quiz.perguntas.length,
        podeReitentar,
        tentativasRestantes
      };
    } catch (error) {
      logger.error('Erro ao submeter quiz', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private calcularNota(quiz: QuizCompleto, respostas: QuizResposta[]): { nota: number; respostasCorretas: number } {
    const totalPerguntas = quiz.perguntas.length;
    let respostasCorretas = 0;

    // Create a map of responses for quick lookup
    const respostasMap = new Map(respostas.map(r => [r.perguntaId, r.respostaSelecionada]));

    // Check each question
    for (const pergunta of quiz.perguntas) {
      const respostaSelecionada = respostasMap.get(pergunta.id);

      if (respostaSelecionada === pergunta.respostaCorreta) {
        respostasCorretas++;
      }
    }

    // Calculate grade on a scale of 0-20
    const nota = Math.round((respostasCorretas / totalPerguntas) * 20);

    return { nota, respostasCorretas };
  }

  async obterTentativasUtilizador(quizId: number, utilizadorId: number): Promise<QuizTentativa[]> {
    return await quizRepository.findTentativasByQuizAndUser(quizId, utilizadorId);
  }

  async obterMelhorTentativa(quizId: number, utilizadorId: number): Promise<QuizTentativa | undefined> {
    return await quizRepository.getBestTentativa(quizId, utilizadorId);
  }

  async obterUltimaTentativa(quizId: number, utilizadorId: number): Promise<QuizTentativa | undefined> {
    return await quizRepository.getLastTentativa(quizId, utilizadorId);
  }

  async podeReitentar(quizId: number, utilizadorId: number): Promise<{ podeReitentar: boolean; tentativasRestantes: number; melhorNota?: number }> {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    const tentativasCount = await quizRepository.countTentativasByQuizAndUser(quizId, utilizadorId);
    const melhorTentativa = await quizRepository.getBestTentativa(quizId, utilizadorId);

    const tentativasRestantes = quiz.maxTentativas - tentativasCount;
    const jaAprovado = melhorTentativa?.aprovado || false;
    const podeReitentar = tentativasRestantes > 0 && !jaAprovado;

    return {
      podeReitentar,
      tentativasRestantes,
      melhorNota: melhorTentativa?.nota
    };
  }
}

export const quizService = new QuizService();