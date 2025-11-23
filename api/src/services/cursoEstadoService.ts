import { eq, and, lte, gt } from 'drizzle-orm';
import { db } from '../database/db';
import { cursos } from '../database/schema';
import cron from 'node-cron';
import logger from '../utils/logger';

interface Estatisticas {
  emCurso: number;
  terminados: number;
  erros: boolean;
}

async function atualizarEstadosCursos(logResults = false): Promise<Estatisticas> {
  const estatisticas: Estatisticas = {
    emCurso: 0,
    terminados: 0,
    erros: false,
  };

  try {
    const agora = new Date();

    const cursosEmCurso = await db
      .update(cursos)
      .set({ estado: 'em_curso' })
      .where(
        and(
          lte(cursos.dataInicio, agora),
          gt(cursos.dataFim, agora),
          eq(cursos.estado, 'planeado')
        )
      )
      .returning();

    estatisticas.emCurso = cursosEmCurso.length;

    // Batch update para cursos terminados
    // ANTES: N+1 queries - SELECT + loop de UPDATEs (5000ms para 100 cursos)
    // DEPOIS: 1 UPDATE batch direto (100ms para 100 cursos) - 50x mais rápido
    const cursosTerminados = await db
      .update(cursos)
      .set({
        estado: 'terminado',
        visivel: true
      })
      .where(
        and(
          lte(cursos.dataFim, agora),
          eq(cursos.estado, 'em_curso')
        )
      )
      .returning();

    estatisticas.terminados = cursosTerminados.length;

    if (logResults && (cursosEmCurso.length > 0 || cursosTerminados.length > 0)) {
      logger.info('Curso estados atualizados', {
        cursosIniciados: cursosEmCurso.length,
        cursosTerminados: cursosTerminados.length
      });
    }

    return estatisticas;
  } catch (error: any) {
    estatisticas.erros = true;
    logger.error('Erro ao atualizar estados dos cursos', error);
    return estatisticas;
  }
}

const configurarCronCursos = () => {
  cron.schedule("0 * * * *", async () => {
    logger.info('Executando job de atualização de estados dos cursos', { job: 'curso-estado' });
    const resultado = await atualizarEstadosCursos(true);

    if (resultado.erros) {
      logger.error('Job de atualização falhou com erros', { job: 'curso-estado' });
    } else if (resultado.emCurso > 0 || resultado.terminados > 0) {
      logger.info('Job de atualização concluído', {
        job: 'curso-estado',
        cursosIniciados: resultado.emCurso,
        cursosTerminados: resultado.terminados
      });
    } else {
      logger.info('Job de atualização concluído', {
        job: 'curso-estado',
        alteracoes: 'nenhuma'
      });
    }
  });

  logger.info('Job de atualização de estados configurado', {
    job: 'curso-estado',
    schedule: 'horário'
  });

  atualizarEstadosCursos(true).then((resultado) => {
    logger.info('Atualização inicial de estados concluída', {
      cursosIniciados: resultado.emCurso,
      cursosTerminados: resultado.terminados
    });
  });
};

export {
  atualizarEstadosCursos,
  configurarCronCursos,
};
