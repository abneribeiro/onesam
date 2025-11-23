import { cursoRepository, type CursoFiltros } from '../repositories/cursoRepository';
import { inscricaoRepository } from '../repositories/inscricaoRepository';
import { areaRepository } from '../repositories/areaRepository';
import { categoriaRepository } from '../repositories/categoriaRepository';
import logger from '../utils/logger';
import type { NewCurso, Curso, EstadoCurso } from '../types';
import type { PaginationParams, PaginatedResult } from '../utils/pagination';

export type { CursoFiltros };

interface CreateCursoDTO {
  nome: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  dataLimiteInscricao?: Date;
  IDArea: number;
  IDCategoria: number;
  limiteVagas?: number;
  nivel?: string;
  cargaHoraria?: number;
}

interface UpdateCursoDTO {
  nome?: string;
  descricao?: string;
  dataInicio?: string | Date;
  dataFim?: string | Date;
  dataLimiteInscricao?: string | Date;
  IDArea?: number;
  IDCategoria?: number;
  visivel?: boolean;
  estado?: EstadoCurso;
  nivel?: string;
  limiteVagas?: number;
  cargaHoraria?: number;
  imagemCurso?: string;
}

export class CursoService {
  async criarCurso(data: CreateCursoDTO): Promise<Curso> {
    try {
      await this.validarDadosCurso(data);

      const [area, categoria] = await Promise.all([
        areaRepository.findById(data.IDArea),
        categoriaRepository.findById(data.IDCategoria)
      ]);

      if (!area) {
        throw new Error('Área não encontrada');
      }
      if (!categoria || categoria.areaId !== data.IDArea) {
        throw new Error('Categoria não encontrada ou não pertence à área');
      }

      const nivelCurso = (data.nivel as 'iniciante' | 'intermedio' | 'avancado') || 'iniciante';

      const cursoData: NewCurso = {
        nome: data.nome,
        descricao: data.descricao,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        dataLimiteInscricao: data.dataLimiteInscricao
          ? new Date(data.dataLimiteInscricao)
          : new Date(data.dataInicio),
        areaId: data.IDArea,
        categoriaId: data.IDCategoria,
        estado: 'planeado',
        visivel: true,
        nivel: nivelCurso,
        certificado: false,
        limiteVagas: data.limiteVagas ? Number(data.limiteVagas) : null,
        cargaHoraria: data.cargaHoraria || null
      };

      const curso = await cursoRepository.create(cursoData);

      return curso;
    } catch (error) {
      logger.error('Erro ao criar curso', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async validarDadosCurso(data: CreateCursoDTO): Promise<void> {
    const required = ['nome', 'dataInicio', 'dataFim', 'IDArea', 'IDCategoria'];

    const missing = required.filter(field => !data[field as keyof CreateCursoDTO]);
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
    }

    const dataInicio = new Date(data.dataInicio);
    const dataFim = new Date(data.dataFim);

    if (dataInicio >= dataFim) {
      throw new Error('Data de início deve ser anterior à data de fim');
    }

    if (data.dataLimiteInscricao) {
      const dataLimite = new Date(data.dataLimiteInscricao);
      if (dataLimite >= dataInicio) {
        throw new Error('Data limite de inscrição deve ser anterior à data de início');
      }
    }
  }

  async atualizarCurso(cursoId: number, data: Partial<Curso>): Promise<Curso> {
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new Error('Curso não encontrado');
    }

    if (data.estado) {
      await this.validarTransicaoEstado(curso.estado, data.estado);
    }

    const cursoAtualizado = await cursoRepository.update(cursoId, data);
    if (!cursoAtualizado) {
      throw new Error('Erro ao atualizar curso');
    }

    return cursoAtualizado;
  }

  buildUpdateData(data: UpdateCursoDTO): Partial<Curso> {
    const updateData: Partial<Curso> = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.descricao) updateData.descricao = data.descricao;
    if (data.dataInicio) updateData.dataInicio = new Date(data.dataInicio);
    if (data.dataFim) updateData.dataFim = new Date(data.dataFim);
    if (data.dataLimiteInscricao) updateData.dataLimiteInscricao = new Date(data.dataLimiteInscricao);
    if (data.IDArea) updateData.areaId = data.IDArea;
    if (data.IDCategoria) updateData.categoriaId = data.IDCategoria;
    if (data.visivel !== undefined) updateData.visivel = data.visivel;
    if (data.estado) updateData.estado = data.estado;
    if (data.nivel) updateData.nivel = data.nivel as 'iniciante' | 'intermedio' | 'avancado';
    if (data.limiteVagas) updateData.limiteVagas = data.limiteVagas;
    if (data.cargaHoraria) updateData.cargaHoraria = data.cargaHoraria;
    if (data.imagemCurso) updateData.imagemCurso = data.imagemCurso;

    return updateData;
  }

  private async validarTransicaoEstado(estadoAtual: EstadoCurso, novoEstado: EstadoCurso): Promise<void> {
    const transicoesValidas: Record<EstadoCurso, EstadoCurso[]> = {
      'planeado': ['em_curso', 'arquivado'],
      'em_curso': ['terminado', 'arquivado'],
      'terminado': ['arquivado'],
      'arquivado': ['planeado']
    };

    const permitidas = transicoesValidas[estadoAtual];
    if (!permitidas.includes(novoEstado)) {
      throw new Error(`Transição de estado inválida: ${estadoAtual} → ${novoEstado}`);
    }
  }

  async deletarCurso(cursoId: number): Promise<void> {
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new Error('Curso não encontrado');
    }

    const inscricoes = await inscricaoRepository.findByCursoId(cursoId);
    const inscricoesAceites = inscricoes.filter(i => i.estado === 'aceite' || i.estado === 'pendente');

    if (inscricoesAceites.length > 0) {
      throw new Error('Não é possível excluir um curso com inscrições ativas ou pendentes');
    }

    await cursoRepository.delete(cursoId);
  }

  async listarCursos(): Promise<Curso[]> {
    return cursoRepository.findAll();
  }

  async listarCursosPaginados(
    pagination?: PaginationParams,
    sortParams?: { sortBy?: string; sortOrder?: 'asc' | 'desc' },
    filtros?: CursoFiltros
  ): Promise<PaginatedResult<Curso>> {
    return cursoRepository.findAllPaginated(pagination, sortParams, filtros);
  }

  async obterCurso(cursoId: number): Promise<Curso> {
    const curso = await cursoRepository.findById(cursoId, { includeRelations: true });
    if (!curso) {
      throw new Error('Curso não encontrado');
    }
    return curso;
  }

  async alterarEstado(cursoId: number, estado: EstadoCurso): Promise<Curso> {
    const estadosValidos: EstadoCurso[] = ['planeado', 'em_curso', 'terminado', 'arquivado'];

    if (!estadosValidos.includes(estado)) {
      throw new Error(`Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`);
    }

    const curso = await this.obterCurso(cursoId);
    await this.validarTransicaoEstado(curso.estado, estado);

    const cursoAtualizado = await cursoRepository.update(cursoId, { estado });
    if (!cursoAtualizado) {
      throw new Error('Erro ao atualizar estado do curso');
    }

    return cursoAtualizado;
  }
}

export const cursoService = new CursoService();
