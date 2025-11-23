import { inscricaoRepository, type InscricaoFiltros } from '../repositories/inscricaoRepository';
import { cursoRepository } from '../repositories/cursoRepository';
import { utilizadorRepository } from '../repositories/utilizadorRepository';
import { notificacaoService } from './notificacaoService';
import { db } from '../database/db';
import { inscricoes } from '../database/schema';
import { eq, count, and } from 'drizzle-orm';
import logger from '../utils/logger';
import type { Inscricao, EstadoInscricao } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';

export type { InscricaoFiltros };

export class InscricaoService {
  async inscreverFormando(formandoId: number, cursoId: number): Promise<Inscricao> {
    try {
      await this.validarElegibilidade(formandoId, cursoId);

      const curso = await cursoRepository.findById(cursoId);
      if (!curso) {
        throw new Error('Curso não encontrado');
      }

      const inscricao = await db.transaction(async (tx) => {
        if (curso.limiteVagas) {
          const [result] = await tx
            .select({ count: count() })
            .from(inscricoes)
            .where(
              and(
                eq(inscricoes.cursoId, cursoId),
                eq(inscricoes.estado, 'aceite')
              )
            );

          const vagasOcupadas = result?.count || 0;

          if (vagasOcupadas >= curso.limiteVagas) {
            throw new Error('Não há vagas disponíveis para este curso');
          }
        }

        const estadoInicial: EstadoInscricao = 'pendente';

        const [novaInscricao] = await tx
          .insert(inscricoes)
          .values({
            cursoId,
            utilizadorId: formandoId,
            estado: estadoInicial,
            dataInscricao: new Date(),
          })
          .returning();

        return novaInscricao;
      });

      return inscricao;
    } catch (error) {
      logger.error('Erro ao inscrever formando', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async validarElegibilidade(formandoId: number, cursoId: number): Promise<void> {
    const utilizador = await utilizadorRepository.findById(formandoId);

    if (!utilizador || utilizador.tipoPerfil !== 'formando') {
      throw new Error('Apenas formandos podem se inscrever em cursos');
    }

    const curso = await cursoRepository.findById(cursoId);

    if (!curso || !curso.visivel) {
      throw new Error('Curso não encontrado ou não disponível para inscrição');
    }

    const estadosPermitidos = ['planeado', 'em_curso'];

    if (!estadosPermitidos.includes(curso.estado)) {
      throw new Error('Este curso não está disponível para inscrição');
    }

    if (curso.dataLimiteInscricao) {
      const agora = new Date();
      if (agora > new Date(curso.dataLimiteInscricao)) {
        throw new Error('O período de inscrição para este curso já terminou');
      }
    }

    const inscricaoExistente = await inscricaoRepository.findByUtilizadorAndCurso(
      formandoId,
      cursoId
    );

    if (inscricaoExistente && inscricaoExistente.estado !== 'cancelada') {
      throw new Error('Você já está inscrito neste curso');
    }
  }

  async aprovarInscricao(inscricaoId: number): Promise<Inscricao> {
    const inscricao = await inscricaoRepository.findById(inscricaoId);
    if (!inscricao) {
      throw new Error('Inscrição não encontrada');
    }

    if (inscricao.estado !== 'pendente') {
      throw new Error('Apenas inscrições pendentes podem ser aprovadas');
    }

    const inscricaoAtualizada = await inscricaoRepository.updateEstado(inscricaoId, 'aceite');

    if (!inscricaoAtualizada) {
      throw new Error('Erro ao atualizar inscrição');
    }

    const utilizador = await utilizadorRepository.findById(inscricao.utilizadorId);
    const curso = await cursoRepository.findById(inscricao.cursoId);

    if (utilizador && curso) {
      // Usar logger ao invés de console.error para rastreabilidade
      notificacaoService.criarNotificacaoInscricaoAprovada(utilizador.id, curso.nome, curso.id).catch(error => {
        logger.error('Erro ao criar notificação de aprovação', {
          error: error instanceof Error ? error.message : String(error),
          utilizadorId: utilizador.id,
          cursoId: curso.id,
          cursoNome: curso.nome,
          tipo: 'inscricao_aprovada',
        });
      });
    }

    return inscricaoAtualizada;
  }

  async rejeitarInscricao(inscricaoId: number, motivo?: string): Promise<Inscricao> {
    const inscricao = await inscricaoRepository.findById(inscricaoId);
    if (!inscricao) {
      throw new Error('Inscrição não encontrada');
    }

    if (inscricao.estado !== 'pendente') {
      throw new Error('Apenas inscrições pendentes podem ser rejeitadas');
    }

    const inscricaoAtualizada = await inscricaoRepository.updateEstado(inscricaoId, 'rejeitada');

    if (!inscricaoAtualizada) {
      throw new Error('Erro ao atualizar inscrição');
    }

    const utilizador = await utilizadorRepository.findById(inscricao.utilizadorId);
    const curso = await cursoRepository.findById(inscricao.cursoId);

    if (utilizador && curso) {
      // Usar logger ao invés de console.error para rastreabilidade
      notificacaoService.criarNotificacaoInscricaoRejeitada(utilizador.id, curso.nome, motivo).catch(error => {
        logger.error('Erro ao criar notificação de rejeição', {
          error: error instanceof Error ? error.message : String(error),
          utilizadorId: utilizador.id,
          cursoNome: curso.nome,
          motivo,
          tipo: 'inscricao_rejeitada',
        });
      });
    }

    return inscricaoAtualizada;
  }

  async cancelarInscricao(inscricaoId: number, utilizadorId: number): Promise<void> {
    const inscricao = await inscricaoRepository.findById(inscricaoId);
    if (!inscricao) {
      throw new Error('Inscrição não encontrada');
    }

    if (inscricao.utilizadorId !== utilizadorId) {
      throw new Error('Você não tem permissão para cancelar esta inscrição');
    }

    if (inscricao.estado === 'cancelada') {
      throw new Error('Esta inscrição já foi cancelada');
    }

    await inscricaoRepository.updateEstado(inscricaoId, 'cancelada');
  }

  async listarInscricoesPorCurso(cursoId: number): Promise<Inscricao[]> {
    return inscricaoRepository.findByCursoId(cursoId);
  }

  async listarInscricoesFormando(formandoId: number): Promise<Inscricao[]> {
    const utilizador = await utilizadorRepository.findById(formandoId);
    if (!utilizador || utilizador.tipoPerfil !== 'formando') {
      throw new Error('Apenas formandos podem visualizar suas inscrições');
    }

    return inscricaoRepository.findByUtilizadorId(formandoId);
  }

  async listarMinhasInscricoes(utilizadorId: number): Promise<Inscricao[]> {
    return inscricaoRepository.findByUtilizadorId(utilizadorId);
  }

  async listarTodas(): Promise<Inscricao[]> {
    return inscricaoRepository.findAll();
  }

  async listarTodasPaginadas(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' },
    filtros?: InscricaoFiltros
  ): Promise<PaginatedResult<Inscricao>> {
    return inscricaoRepository.findAllPaginated(pagination, sortParams, filtros);
  }
}

export const inscricaoService = new InscricaoService();
