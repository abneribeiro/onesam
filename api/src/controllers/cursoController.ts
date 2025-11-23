import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { AuthenticatedRequest } from '../middlewares/betterAuthMiddleware';
import { cursoRepository } from '../repositories/cursoRepository';
import { sendData, sendCreated, sendSuccess, sendBadRequest } from '../utils/responseHelper';
import { SupabaseStorageService } from '../services/supabaseStorageService';
import { cursoService } from '../services/cursoService';

const supabaseStorageService = new SupabaseStorageService();

export const criarCurso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const curso = await cursoService.criarCurso(req.body);

    if (req.file) {
      const imagemUrl = await supabaseStorageService.uploadCourseImage(
        req.file.buffer,
        curso.id,
        req.file.mimetype
      );
      const cursoAtualizado = await cursoRepository.update(curso.id, { imagemCurso: imagemUrl });
      sendCreated(res, 'Curso criado com sucesso', { curso: cursoAtualizado });
      return;
    }

    sendCreated(res, 'Curso criado com sucesso', { curso });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const listarCursos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder, search, areaId, categoriaId, estado, nivel } = req.query;

    if (page || limit) {
      const filtros: {
        search?: string;
        areaId?: number;
        categoriaId?: number;
        estado?: 'planeado' | 'em_curso' | 'terminado' | 'arquivado';
        nivel?: 'iniciante' | 'intermedio' | 'avancado';
        visivel?: boolean;
      } = {
        search: search as string | undefined,
        areaId: areaId ? Number(areaId) : undefined,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
        estado: estado as 'planeado' | 'em_curso' | 'terminado' | 'arquivado' | undefined,
        nivel: nivel as 'iniciante' | 'intermedio' | 'avancado' | undefined,
      };

      // SECURITY: Se não houver utilizador autenticado, forçar filtros de segurança
      // Apenas cursos visíveis e em curso devem ser acessíveis publicamente
      const authReq = req as AuthenticatedRequest;
      if (!authReq.utilizador) {
        filtros.visivel = true;
        filtros.estado = 'em_curso';
      }

      const result = await cursoService.listarCursosPaginados(
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        {
          sortBy: sortBy as string | undefined,
          sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        },
        filtros
      );
      sendData(res, result);
    } else {
      const cursos = await cursoService.listarCursos();
      sendData(res, cursos);
    }
  } catch (error) {
    next(error);
  }
};

export const obterCurso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const curso = await cursoService.obterCurso(Number(id));
    sendData(res, curso);
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const atualizarCurso = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cursoId = Number(id);

    const updateData = cursoService.buildUpdateData(req.body);

    if (req.file) {
      const curso = await cursoRepository.findById(cursoId);
      if (curso?.imagemCurso) {
        await supabaseStorageService.deleteOldCourseImage(curso.imagemCurso);
      }
      const imagemUrl = await supabaseStorageService.uploadCourseImage(
        req.file.buffer,
        cursoId,
        req.file.mimetype
      );
      updateData.imagemCurso = imagemUrl;
    }

    const cursoAtualizado = await cursoService.atualizarCurso(cursoId, updateData);

    sendSuccess(res, 200, 'Curso atualizado com sucesso', { curso: cursoAtualizado });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const deletarCurso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await cursoService.deletarCurso(Number(id));
    sendSuccess(res, 200, 'Curso deletado com sucesso');
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const alterarEstado = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const curso = await cursoService.alterarEstado(Number(id), estado);
    sendSuccess(res, 200, 'Estado do curso atualizado com sucesso', { curso });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};

export const deletarCursosEmMassa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      sendBadRequest(res, 'IDs inválidos');
      return;
    }

    const deletedCount = await cursoRepository.deleteMany(ids.map(Number));
    sendSuccess(res, 200, `${deletedCount} curso(s) eliminado(s) com sucesso`, { deletedCount });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendBadRequest(res, error.message);
      return;
    }
    next(error);
  }
};
