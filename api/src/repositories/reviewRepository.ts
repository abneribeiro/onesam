import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../database/db';
import { reviews } from '../database/schema';

export interface NewReview {
  cursoId: number;
  utilizadorId: number;
  rating: number;
  comentario?: string;
}

export interface UpdateReview {
  rating?: number;
  comentario?: string;
}

export interface Review {
  id: number;
  cursoId: number;
  utilizadorId: number;
  rating: number;
  comentario: string | null;
  dataCriacao: Date;
  dataAtualizacao: Date | null;
  utilizador?: {
    nome: string;
    avatar: string | null;
  };
}

export interface ReviewStats {
  totalReviews: number;
  mediaRating: number;
  distribuicao: {
    estrela1: number;
    estrela2: number;
    estrela3: number;
    estrela4: number;
    estrela5: number;
  };
}

export class ReviewRepository {
  async create(data: NewReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        cursoId: data.cursoId,
        utilizadorId: data.utilizadorId,
        rating: data.rating,
        comentario: data.comentario,
      })
      .returning();
    return review;
  }

  async findById(id: number): Promise<Review | undefined> {
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
      with: {
        utilizador: {
          columns: {
            nome: true,
            avatar: true,
          },
        },
      },
    });
    return review;
  }

  async findByCursoId(cursoId: number): Promise<Review[]> {
    const result = await db.query.reviews.findMany({
      where: eq(reviews.cursoId, cursoId),
      with: {
        utilizador: {
          columns: {
            nome: true,
            avatar: true,
          },
        },
      },
      orderBy: [desc(reviews.dataCriacao)],
    });
    return result;
  }

  async findByUtilizadorId(utilizadorId: number): Promise<Review[]> {
    const result = await db.query.reviews.findMany({
      where: eq(reviews.utilizadorId, utilizadorId),
      orderBy: [desc(reviews.dataCriacao)],
    });
    return result;
  }

  async findByCursoAndUtilizador(cursoId: number, utilizadorId: number): Promise<Review | undefined> {
    const review = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.cursoId, cursoId),
        eq(reviews.utilizadorId, utilizadorId)
      ),
    });
    return review;
  }

  async update(id: number, data: UpdateReview): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set({
        ...data,
        dataAtualizacao: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async getStatsByCursoId(cursoId: number): Promise<ReviewStats> {
    const result = await db
      .select({
        totalReviews: sql<number>`count(*)::int`,
        mediaRating: sql<number>`COALESCE(AVG(${reviews.rating})::numeric(3,2), 0)`,
        estrela1: sql<number>`count(*) FILTER (WHERE ${reviews.rating} = 1)::int`,
        estrela2: sql<number>`count(*) FILTER (WHERE ${reviews.rating} = 2)::int`,
        estrela3: sql<number>`count(*) FILTER (WHERE ${reviews.rating} = 3)::int`,
        estrela4: sql<number>`count(*) FILTER (WHERE ${reviews.rating} = 4)::int`,
        estrela5: sql<number>`count(*) FILTER (WHERE ${reviews.rating} = 5)::int`,
      })
      .from(reviews)
      .where(eq(reviews.cursoId, cursoId));

    const stats = result[0];

    return {
      totalReviews: stats.totalReviews,
      mediaRating: Number(stats.mediaRating),
      distribuicao: {
        estrela1: stats.estrela1,
        estrela2: stats.estrela2,
        estrela3: stats.estrela3,
        estrela4: stats.estrela4,
        estrela5: stats.estrela5,
      },
    };
  }
}

export const reviewRepository = new ReviewRepository();
