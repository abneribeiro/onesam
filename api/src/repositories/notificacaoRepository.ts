import { db } from '../database/db';
import { notificacoes } from '../database/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import type { Notificacao, NewNotificacao } from '../types';

class NotificacaoRepository {
  async create(data: NewNotificacao): Promise<Notificacao> {
    const [notificacao] = await db.insert(notificacoes).values(data).returning();
    return notificacao;
  }

  async findById(id: number): Promise<Notificacao | undefined> {
    const [notificacao] = await db
      .select()
      .from(notificacoes)
      .where(eq(notificacoes.id, id))
      .limit(1);
    return notificacao;
  }

  async findByUtilizadorId(utilizadorId: number, limit = 50): Promise<Notificacao[]> {
    return db
      .select()
      .from(notificacoes)
      .where(eq(notificacoes.utilizadorId, utilizadorId))
      .orderBy(desc(notificacoes.dataCriacao))
      .limit(limit);
  }

  async findNaoLidasByUtilizadorId(utilizadorId: number): Promise<Notificacao[]> {
    return db
      .select()
      .from(notificacoes)
      .where(
        and(
          eq(notificacoes.utilizadorId, utilizadorId),
          eq(notificacoes.lida, false)
        )
      )
      .orderBy(desc(notificacoes.dataCriacao));
  }

  async countNaoLidasByUtilizadorId(utilizadorId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notificacoes)
      .where(
        and(
          eq(notificacoes.utilizadorId, utilizadorId),
          eq(notificacoes.lida, false)
        )
      );
    return result?.count || 0;
  }

  async marcarComoLida(id: number): Promise<Notificacao | undefined> {
    const [notificacao] = await db
      .update(notificacoes)
      .set({
        lida: true,
        dataLeitura: new Date(),
      })
      .where(eq(notificacoes.id, id))
      .returning();
    return notificacao;
  }

  async marcarTodasComoLidas(utilizadorId: number): Promise<void> {
    await db
      .update(notificacoes)
      .set({
        lida: true,
        dataLeitura: new Date(),
      })
      .where(
        and(
          eq(notificacoes.utilizadorId, utilizadorId),
          eq(notificacoes.lida, false)
        )
      );
  }

  async delete(id: number): Promise<void> {
    await db.delete(notificacoes).where(eq(notificacoes.id, id));
  }
}

export const notificacaoRepository = new NotificacaoRepository();
export default NotificacaoRepository;
