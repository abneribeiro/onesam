import { eq, count, sql, inArray } from 'drizzle-orm';
import { db } from '../database/db';
import { utilizadores, account } from '../database/schema';
import type { Utilizador, NewUtilizador } from '../types';
import { hashPassword } from '../utils/password';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';
import { executePaginatedQuery, buildOrderBy } from '../utils/pagination';

export class UtilizadorRepository {
  async create(data: NewUtilizador): Promise<Utilizador> {
    const [utilizador] = await db
      .insert(utilizadores)
      .values({
        ...data,
        email: data.email.toLowerCase().trim(),
        nome: data.nome.trim(),
      })
      .returning();
    return utilizador;
  }

  async findAll(): Promise<Utilizador[]> {
    return await db.query.utilizadores.findMany();
  }

  async findAllPaginated(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<PaginatedResult<Utilizador>> {
    const columnMap = {
      nome: utilizadores.nome,
      email: utilizadores.email,
      tipoPerfil: utilizadores.tipoPerfil,
      ativo: utilizadores.ativo,
      dataCriacao: utilizadores.dataCriacao,
    };

    const orderByClause = buildOrderBy(columnMap, sortParams) || sql`${utilizadores.dataCriacao} DESC`;

    const query = db
      .select()
      .from(utilizadores)
      .orderBy(orderByClause);

    const countQuery = db.select({ count: count() }).from(utilizadores);

    return executePaginatedQuery<Utilizador>(query, countQuery, pagination);
  }

  async findById(id: number): Promise<Utilizador | undefined> {
    return await db.query.utilizadores.findFirst({
      where: eq(utilizadores.id, id),
    });
  }

  async findByEmail(email: string): Promise<Utilizador | undefined> {
    // Normalizar email (lowercase e trim)
    const normalizedEmail = email.toLowerCase().trim();
    return await db.query.utilizadores.findFirst({
      where: eq(utilizadores.email, normalizedEmail),
    });
  }

  async update(id: number, data: Partial<NewUtilizador>): Promise<Utilizador | undefined> {
    // Tipagem correta ao invés de `any`
    const updateData: Partial<NewUtilizador> & { dataAtualizacao: Date } = {
      ...data,
      dataAtualizacao: new Date()
    };

    const [utilizador] = await db
      .update(utilizadores)
      .set(updateData)
      .where(eq(utilizadores.id, id))
      .returning();
    return utilizador;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(utilizadores).where(eq(utilizadores.id, id)).returning();
    return result.length > 0;
  }

  async updatePassword(id: number, novaSenha: string): Promise<void> {
    const hashedPassword = await hashPassword(novaSenha);
    // Atualiza a senha na tabela Account do Better Auth
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.userId, id));
  }

  async getPasswordHash(userId: number): Promise<string | null> {
    // Obtém o hash da senha da tabela Account do Better Auth
    const result = await db.query.account.findFirst({
      where: eq(account.userId, userId),
    });
    return result?.password ?? null;
  }

  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(utilizadores).where(inArray(utilizadores.id, ids)).returning();
    return result.length;
  }
}

export const utilizadorRepository = new UtilizadorRepository();
