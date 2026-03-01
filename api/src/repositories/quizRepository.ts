import { eq, desc, count, and, sql } from 'drizzle-orm';
import { db } from '../database/db';
import { quizzes, quizPerguntas, quizTentativas } from '../database/schema';
import type {
  Quiz,
  NewQuiz,
  QuizPergunta,
  NewQuizPergunta,
  QuizTentativa,
  NewQuizTentativa,
  QuizCompleto,
  QuizPerguntaCompleta
} from '../types';

export class QuizRepository {
  // Quiz CRUD operations
  async create(data: NewQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(data).returning();
    return quiz;
  }

  async findById(id: number): Promise<Quiz | undefined> {
    return await db.query.quizzes.findFirst({
      where: eq(quizzes.id, id)
    });
  }

  async findByAulaId(aulaId: number): Promise<Quiz[]> {
    return await db.query.quizzes.findMany({
      where: eq(quizzes.aulaId, aulaId),
      orderBy: [desc(quizzes.dataCriacao)]
    });
  }

  async findCompleto(id: number): Promise<QuizCompleto | undefined> {
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, id),
      with: {
        perguntas: {
          orderBy: (perguntas, { asc }) => [asc(perguntas.ordem)]
        }
      }
    });

    if (!quiz) return undefined;

    // Parse JSON options for each question
    const perguntasCompletas: QuizPerguntaCompleta[] = quiz.perguntas.map(pergunta => ({
      ...pergunta,
      opcoes: JSON.parse(pergunta.opcoesJson).map((texto: string, indice: number) => ({
        texto,
        indice
      }))
    }));

    return {
      ...quiz,
      perguntas: perguntasCompletas
    };
  }

  async update(id: number, data: Partial<NewQuiz>): Promise<Quiz | undefined> {
    const [quiz] = await db
      .update(quizzes)
      .set({ ...data, dataAtualizacao: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return result.length > 0;
  }

  // Quiz Questions CRUD operations
  async createPergunta(data: NewQuizPergunta): Promise<QuizPergunta> {
    const [pergunta] = await db.insert(quizPerguntas).values(data).returning();
    return pergunta;
  }

  async findPerguntasByQuizId(quizId: number): Promise<QuizPergunta[]> {
    return await db.query.quizPerguntas.findMany({
      where: eq(quizPerguntas.quizId, quizId),
      orderBy: (perguntas, { asc }) => [asc(perguntas.ordem)]
    });
  }

  async updatePergunta(id: number, data: Partial<NewQuizPergunta>): Promise<QuizPergunta | undefined> {
    const [pergunta] = await db
      .update(quizPerguntas)
      .set(data)
      .where(eq(quizPerguntas.id, id))
      .returning();
    return pergunta;
  }

  async deletePergunta(id: number): Promise<boolean> {
    const result = await db.delete(quizPerguntas).where(eq(quizPerguntas.id, id)).returning();
    return result.length > 0;
  }

  async deletePerguntasByQuizId(quizId: number): Promise<number> {
    const result = await db.delete(quizPerguntas).where(eq(quizPerguntas.quizId, quizId)).returning();
    return result.length;
  }

  // Quiz Attempts CRUD operations
  async createTentativa(data: NewQuizTentativa): Promise<QuizTentativa> {
    const [tentativa] = await db.insert(quizTentativas).values(data).returning();
    return tentativa;
  }

  async findTentativasByQuizAndUser(quizId: number, utilizadorId: number): Promise<QuizTentativa[]> {
    return await db.query.quizTentativas.findMany({
      where: and(
        eq(quizTentativas.quizId, quizId),
        eq(quizTentativas.utilizadorId, utilizadorId)
      ),
      orderBy: [desc(quizTentativas.dataCriacao)]
    });
  }

  async countTentativasByQuizAndUser(quizId: number, utilizadorId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(quizTentativas)
      .where(and(
        eq(quizTentativas.quizId, quizId),
        eq(quizTentativas.utilizadorId, utilizadorId)
      ));

    return result.count;
  }

  async getLastTentativa(quizId: number, utilizadorId: number): Promise<QuizTentativa | undefined> {
    return await db.query.quizTentativas.findFirst({
      where: and(
        eq(quizTentativas.quizId, quizId),
        eq(quizTentativas.utilizadorId, utilizadorId)
      ),
      orderBy: [desc(quizTentativas.dataCriacao)]
    });
  }

  async getBestTentativa(quizId: number, utilizadorId: number): Promise<QuizTentativa | undefined> {
    return await db.query.quizTentativas.findFirst({
      where: and(
        eq(quizTentativas.quizId, quizId),
        eq(quizTentativas.utilizadorId, utilizadorId)
      ),
      orderBy: [sql`${quizTentativas.nota} DESC, ${quizTentativas.dataCriacao} DESC`]
    });
  }

  async findTentativaById(id: number): Promise<QuizTentativa | undefined> {
    return await db.query.quizTentativas.findFirst({
      where: eq(quizTentativas.id, id)
    });
  }
}

export const quizRepository = new QuizRepository();