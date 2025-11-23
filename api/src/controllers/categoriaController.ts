import { Request, Response, NextFunction } from 'express';
import { categoriaRepository } from '../repositories/categoriaRepository';
import { categoriaService } from '../services/categoriaService';
import { areaRepository } from '../repositories/areaRepository';
import { sendData, sendNotFound, sendNoContent } from '../utils/responseHelper';

export const criarCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, descricao, IDArea } = req.body;

    const area = await areaRepository.findById(IDArea);
    if (!area) {
      sendNotFound(res, 'Área não encontrada');
      return;
    }

    const categoria = await categoriaRepository.create({
      nome,
      descricao,
      areaId: IDArea
    });

    sendData(res, categoria, 201);
  } catch (error) {
    next(error);
  }
};

export const listarCategorias = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { IDArea, page, limit, sortBy, sortOrder } = req.query;

    if (page || limit) {
      const result = await categoriaService.listarCategoriasPaginadas(
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        {
          sortBy: sortBy as string | undefined,
          sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        }
      );
      sendData(res, result);
    } else if (IDArea) {
      const categorias = await categoriaRepository.findByAreaId(Number(IDArea));
      sendData(res, categorias);
    } else {
      const categorias = await categoriaRepository.findAll();
      sendData(res, categorias);
    }
  } catch (error) {
    next(error);
  }
};

export const obterCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaRepository.findById(Number(id));

    if (!categoria) {
      sendNotFound(res, 'Categoria não encontrada');
      return;
    }

    sendData(res, categoria);
  } catch (error) {
    next(error);
  }
};

export const atualizarCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nome, descricao, IDArea } = req.body;

    const categoria = await categoriaRepository.findById(Number(id));
    if (!categoria) {
      sendNotFound(res, 'Categoria não encontrada');
      return;
    }

    if (IDArea) {
      const area = await areaRepository.findById(IDArea);
      if (!area) {
        sendNotFound(res, 'Área não encontrada');
        return;
      }
    }

    const categoriaAtualizada = await categoriaRepository.update(Number(id), {
      nome,
      descricao,
      areaId: IDArea
    });

    sendData(res, categoriaAtualizada);
  } catch (error) {
    next(error);
  }
};

export const deletarCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const categoria = await categoriaRepository.findById(Number(id));
    if (!categoria) {
      sendNotFound(res, 'Categoria não encontrada');
      return;
    }

    await categoriaRepository.delete(Number(id));
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const deletarCategoriasEmMassa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'IDs inválidos' });
      return;
    }

    const deletedCount = await categoriaRepository.deleteMany(ids.map(Number));
    sendData(res, { deletedCount, message: `${deletedCount} categoria(s) eliminada(s) com sucesso` });
  } catch (error) {
    next(error);
  }
};
