import { Request, Response, NextFunction } from 'express';
import { areaRepository } from '../repositories/areaRepository';
import { areaService } from '../services/areaService';
import { sendData, sendNotFound, sendNoContent } from '../utils/responseHelper';

export const criarArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nome, descricao } = req.body;

        const area = await areaRepository.create({
            nome,
            descricao
        });

        sendData(res, area, 201);
    } catch (error) {
        next(error);
    }
};

export const listarAreas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, sortBy, sortOrder } = req.query;

        if (page || limit) {
            const result = await areaService.listarAreasPaginadas(
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
        } else {
            const areas = await areaRepository.findAll();
            sendData(res, areas);
        }
    } catch (error) {
        next(error);
    }
};

export const obterArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const area = await areaRepository.findById(Number(id));

        if (!area) {
            sendNotFound(res, 'Área não encontrada');
            return;
        }

        sendData(res, area);
    } catch (error) {
        next(error);
    }
};

export const atualizarArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        const area = await areaRepository.findById(Number(id));
        if (!area) {
            sendNotFound(res, 'Área não encontrada');
            return;
        }

        const areaAtualizada = await areaRepository.update(Number(id), {
            nome,
            descricao
        });

        sendData(res, areaAtualizada);
    } catch (error) {
        next(error);
    }
};

export const deletarArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const area = await areaRepository.findById(Number(id));
        if (!area) {
            sendNotFound(res, 'Área não encontrada');
            return;
        }

        await areaRepository.delete(Number(id));
        sendNoContent(res);
    } catch (error) {
        next(error);
    }
};

export const deletarAreasEmMassa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'IDs inválidos' });
            return;
        }

        const deletedCount = await areaRepository.deleteMany(ids.map(Number));
        sendData(res, { deletedCount, message: `${deletedCount} área(s) eliminada(s) com sucesso` });
    } catch (error) {
        next(error);
    }
};
