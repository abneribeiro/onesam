import { eq, count, sql, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../database/db';
import {
  cursos,
  inscricoes,
  utilizadores,
  certificados,
  progressoAulas,
  aulas,
  modulos
} from '../database/schema';
import logger from '../utils/logger';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface KPIData {
  totalCursos: number;
  totalUtilizadores: number;
  totalInscricoes: number;
  totalCertificados: number;
  cursosAtivos: number;
  taxaConclusaoMedia: number;
}

export interface ConclusaoMensal {
  mes: string;
  conclusoes: number;
  certificados: number;
}

export interface CursoAnalytics {
  cursoId: number;
  cursoNome: string;
  totalInscricoes: number;
  conclusoes: number;
  taxaConclusao: number;
  certificadosEmitidos: number;
}

export interface ExportData {
  utilizadorNome: string;
  utilizadorEmail: string;
  cursoNome: string;
  dataInscricao: string;
  estadoInscricao: string;
  progressoPercentual: number;
  dataConclusao?: string;
  certificadoEmitido: boolean;
}

export class AnalyticsService {
  /**
   * Gets basic KPIs for the dashboard
   */
  async obterKPIs(): Promise<KPIData> {
    try {
      const [
        totalCursosResult,
        totalUtilizadoresResult,
        totalInscricoesResult,
        totalCertificadosResult,
        cursosAtivosResult
      ] = await Promise.all([
        db.select({ count: count() }).from(cursos),
        db.select({ count: count() }).from(utilizadores),
        db.select({ count: count() }).from(inscricoes),
        db.select({ count: count() }).from(certificados),
        db.select({ count: count() }).from(cursos).where(eq(cursos.estado, 'em_curso'))
      ]);

      // Calculate average completion rate
      const taxaConclusaoMedia = await this.calcularTaxaConclusaoMedia();

      return {
        totalCursos: totalCursosResult[0].count,
        totalUtilizadores: totalUtilizadoresResult[0].count,
        totalInscricoes: totalInscricoesResult[0].count,
        totalCertificados: totalCertificadosResult[0].count,
        cursosAtivos: cursosAtivosResult[0].count,
        taxaConclusaoMedia
      };
    } catch (error) {
      logger.error('Erro ao obter KPIs', { error });
      throw new Error('Erro ao obter estatísticas gerais');
    }
  }

  /**
   * Gets monthly completion data for the last 12 months
   */
  async obterConclusoesMensais(): Promise<ConclusaoMensal[]> {
    try {
      const resultados: ConclusaoMensal[] = [];
      const hoje = new Date();

      for (let i = 11; i >= 0; i--) {
        const mes = subMonths(hoje, i);
        const inicioMes = startOfMonth(mes);
        const fimMes = endOfMonth(mes);

        // Get completions (users who completed all lessons in a course)
        const conclusoesQuery = sql`
          SELECT COUNT(DISTINCT CONCAT(pa.utilizadorId, '-', m.cursoId)) as conclusoes
          FROM ${progressoAulas} pa
          INNER JOIN ${aulas} a ON pa.aulaId = a.id
          INNER JOIN ${modulos} m ON a.moduloId = m.id
          WHERE pa.concluida = true
          AND pa.dataConclusao >= ${inicioMes}
          AND pa.dataConclusao <= ${fimMes}
          AND NOT EXISTS (
            SELECT 1 FROM ${aulas} a2
            INNER JOIN ${modulos} m2 ON a2.moduloId = m2.id
            WHERE m2.cursoId = m.cursoId
            AND a2.obrigatoria = true
            AND NOT EXISTS (
              SELECT 1 FROM ${progressoAulas} pa2
              WHERE pa2.aulaId = a2.id
              AND pa2.utilizadorId = pa.utilizadorId
              AND pa2.concluida = true
            )
          )
        `;

        const [conclusoesResult] = await db.execute(conclusoesQuery);

        // Get certificates issued in this month
        const [certificadosResult] = await db
          .select({ count: count() })
          .from(certificados)
          .where(and(
            gte(certificados.dataEmissao, inicioMes),
            lte(certificados.dataEmissao, fimMes)
          ));

        const mesesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mesIndex = mes.getMonth();
        const ano = mes.getFullYear();

        resultados.push({
          mes: `${mesesPt[mesIndex]} ${ano}`,
          conclusoes: Number(conclusoesResult.conclusoes) || 0,
          certificados: certificadosResult.count
        });
      }

      return resultados;
    } catch (error) {
      logger.error('Erro ao obter conclusões mensais', { error });
      throw new Error('Erro ao obter dados mensais');
    }
  }

  /**
   * Gets analytics data for each course
   */
  async obterAnalyticsCursos(): Promise<CursoAnalytics[]> {
    try {
      // Get basic course data with enrollments
      const cursosData = await db
        .select({
          cursoId: cursos.id,
          cursoNome: cursos.nome,
          totalInscricoes: count(inscricoes.id)
        })
        .from(cursos)
        .leftJoin(inscricoes, and(
          eq(inscricoes.cursoId, cursos.id),
          eq(inscricoes.estado, 'aceite')
        ))
        .groupBy(cursos.id, cursos.nome)
        .orderBy(desc(count(inscricoes.id)));

      // Get completion and certificate data for each course
      const resultado: CursoAnalytics[] = [];

      for (const curso of cursosData) {
        // Calculate completions and certificates
        const [certificadosResult] = await db
          .select({ count: count() })
          .from(certificados)
          .where(eq(certificados.cursoId, curso.cursoId));

        const conclusoes = certificadosResult.count; // Assuming certificate = completion
        const taxaConclusao = curso.totalInscricoes > 0
          ? Math.round((conclusoes / curso.totalInscricoes) * 100)
          : 0;

        resultado.push({
          cursoId: curso.cursoId,
          cursoNome: curso.cursoNome,
          totalInscricoes: curso.totalInscricoes,
          conclusoes,
          taxaConclusao,
          certificadosEmitidos: conclusoes
        });
      }

      return resultado;
    } catch (error) {
      logger.error('Erro ao obter analytics dos cursos', { error });
      throw new Error('Erro ao obter dados dos cursos');
    }
  }

  /**
   * Exports enrollment data with progress information
   */
  async exportarDados(): Promise<ExportData[]> {
    try {
      const inscricoesData = await db
        .select({
          utilizadorNome: utilizadores.nome,
          utilizadorEmail: utilizadores.email,
          cursoNome: cursos.nome,
          dataInscricao: inscricoes.dataInscricao,
          estadoInscricao: inscricoes.estado,
          cursoId: cursos.id,
          utilizadorId: utilizadores.id
        })
        .from(inscricoes)
        .innerJoin(utilizadores, eq(inscricoes.utilizadorId, utilizadores.id))
        .innerJoin(cursos, eq(inscricoes.cursoId, cursos.id))
        .where(eq(inscricoes.estado, 'aceite'))
        .orderBy(desc(inscricoes.dataInscricao));

      // Get progress and certificate data for each enrollment
      const resultado: ExportData[] = [];

      for (const inscricao of inscricoesData) {
        // Get progress percentage
        const progressQuery = sql`
          SELECT
            COUNT(DISTINCT a.id) as totalAulas,
            COUNT(DISTINCT CASE WHEN pa.concluida = true THEN pa.aulaId END) as aulasConcluidas,
            MAX(pa.dataConclusao) as ultimaConclusao
          FROM ${modulos} m
          INNER JOIN ${aulas} a ON m.id = a.moduloId
          LEFT JOIN ${progressoAulas} pa ON a.id = pa.aulaId AND pa.utilizadorId = ${inscricao.utilizadorId}
          WHERE m.cursoId = ${inscricao.cursoId}
          AND a.obrigatoria = true
        `;

        const [progressResult] = await db.execute(progressQuery);
        const totalAulas = Number(progressResult.totalAulas) || 0;
        const aulasConcluidas = Number(progressResult.aulasConcluidas) || 0;
        const progressoPercentual = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;

        // Check if certificate was issued
        const [certificadoResult] = await db
          .select({ id: certificados.id, dataEmissao: certificados.dataEmissao })
          .from(certificados)
          .where(and(
            eq(certificados.utilizadorId, inscricao.utilizadorId),
            eq(certificados.cursoId, inscricao.cursoId)
          ));

        resultado.push({
          utilizadorNome: inscricao.utilizadorNome,
          utilizadorEmail: inscricao.utilizadorEmail,
          cursoNome: inscricao.cursoNome,
          dataInscricao: inscricao.dataInscricao.toISOString().split('T')[0],
          estadoInscricao: inscricao.estadoInscricao,
          progressoPercentual,
          dataConclusao: certificadoResult ?
            certificadoResult.dataEmissao.toISOString().split('T')[0] :
            undefined,
          certificadoEmitido: !!certificadoResult
        });
      }

      return resultado;
    } catch (error) {
      logger.error('Erro ao exportar dados', { error });
      throw new Error('Erro ao exportar dados');
    }
  }

  /**
   * Calculates average completion rate across all courses
   */
  private async calcularTaxaConclusaoMedia(): Promise<number> {
    try {
      const analytics = await this.obterAnalyticsCursos();

      if (analytics.length === 0) return 0;

      const somaTaxas = analytics.reduce((sum, curso) => sum + curso.taxaConclusao, 0);
      return Math.round(somaTaxas / analytics.length);
    } catch (error) {
      logger.error('Erro ao calcular taxa de conclusão média', { error });
      return 0;
    }
  }

  /**
   * Generates CSV content from export data
   */
  gerarCSV(dados: ExportData[]): string {
    const headers = [
      'Nome do Utilizador',
      'Email',
      'Curso',
      'Data de Inscrição',
      'Estado da Inscrição',
      'Progresso (%)',
      'Data de Conclusão',
      'Certificado Emitido'
    ];

    const csvContent = [
      headers.join(','),
      ...dados.map(row => [
        `"${row.utilizadorNome}"`,
        `"${row.utilizadorEmail}"`,
        `"${row.cursoNome}"`,
        row.dataInscricao,
        row.estadoInscricao,
        row.progressoPercentual,
        row.dataConclusao || '',
        row.certificadoEmitido ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

export const analyticsService = new AnalyticsService();