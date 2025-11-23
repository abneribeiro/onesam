import { moduloRepository, type NewModulo, type UpdateModulo, type Modulo } from '../repositories/moduloRepository';
import { cursoRepository } from '../repositories/cursoRepository';
import { CustomError } from '../utils/errorHandler';

export class ModuloService {
  async create(data: NewModulo): Promise<Modulo> {
    // Verificar se o curso existe
    const curso = await cursoRepository.findById(data.cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    // Se ordem não foi especificada, colocar no final
    if (data.ordem === undefined) {
      const count = await moduloRepository.countByCursoId(data.cursoId);
      data.ordem = count;
    }

    return await moduloRepository.create(data);
  }

  async findAll(): Promise<Modulo[]> {
    return await moduloRepository.findAll();
  }

  async findByCursoId(cursoId: number, includeRelations: boolean = false): Promise<Modulo[]> {
    // Verificar se o curso existe
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    return await moduloRepository.findByCursoId(cursoId, { includeRelations });
  }

  async findById(id: number, includeRelations: boolean = false): Promise<Modulo> {
    const modulo = await moduloRepository.findById(id, { includeRelations });
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }
    return modulo;
  }

  async update(id: number, data: UpdateModulo): Promise<Modulo> {
    const modulo = await moduloRepository.findById(id);
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }

    const updated = await moduloRepository.update(id, data);
    if (!updated) {
      throw new CustomError('Erro ao atualizar módulo', 500);
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const modulo = await moduloRepository.findById(id);
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }

    const deleted = await moduloRepository.delete(id);
    if (!deleted) {
      throw new CustomError('Erro ao deletar módulo', 500);
    }
  }

  async reorder(cursoId: number, modulosOrdenados: { id: number; ordem: number }[]): Promise<void> {
    // Verificar se o curso existe
    const curso = await cursoRepository.findById(cursoId);
    if (!curso) {
      throw new CustomError('Curso não encontrado', 404);
    }

    // Verificar se todos os módulos pertencem ao curso
    const modulosDoCurso = await moduloRepository.findByCursoId(cursoId);
    const idsModulosDoCurso = modulosDoCurso.map((m) => m.id);

    for (const { id } of modulosOrdenados) {
      if (!idsModulosDoCurso.includes(id)) {
        throw new CustomError(`Módulo ${id} não pertence ao curso ${cursoId}`, 400);
      }
    }

    await moduloRepository.reorder(cursoId, modulosOrdenados);
  }
}

export const moduloService = new ModuloService();
