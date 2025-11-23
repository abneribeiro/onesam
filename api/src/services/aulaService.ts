import { aulaRepository, type NewAula, type UpdateAula, type Aula } from '../repositories/aulaRepository';
import { moduloRepository } from '../repositories/moduloRepository';
import { CustomError } from '../utils/errorHandler';
import { supabaseStorageService } from './supabaseStorageService';

export class AulaService {
  async create(data: NewAula): Promise<Aula> {
    // Verificar se o módulo existe
    const modulo = await moduloRepository.findById(data.moduloId);
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }

    // Se ordem não foi especificada, colocar no final
    if (data.ordem === undefined) {
      const count = await aulaRepository.countByModuloId(data.moduloId);
      data.ordem = count;
    }

    return await aulaRepository.create(data);
  }

  async findAll(): Promise<Aula[]> {
    return await aulaRepository.findAll();
  }

  async findByModuloId(moduloId: number): Promise<Aula[]> {
    // Verificar se o módulo existe
    const modulo = await moduloRepository.findById(moduloId);
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }

    return await aulaRepository.findByModuloId(moduloId);
  }

  async findById(id: number, includeRelations: boolean = false): Promise<Aula> {
    const aula = await aulaRepository.findById(id, { includeRelations });
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }
    return aula;
  }

  async findByIdWithProgresso(aulaId: number, utilizadorId: number): Promise<any> {
    const aula = await aulaRepository.findByIdWithProgresso(aulaId, utilizadorId);
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }
    return aula;
  }

  async update(id: number, data: UpdateAula): Promise<Aula> {
    const aula = await aulaRepository.findById(id);
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }

    const updated = await aulaRepository.update(id, data);
    if (!updated) {
      throw new CustomError('Erro ao atualizar aula', 500);
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const aula = await aulaRepository.findById(id);
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }

    const deleted = await aulaRepository.delete(id);
    if (!deleted) {
      throw new CustomError('Erro ao deletar aula', 500);
    }
  }

  async reorder(moduloId: number, aulasOrdenadas: { id: number; ordem: number }[]): Promise<void> {
    // Verificar se o módulo existe
    const modulo = await moduloRepository.findById(moduloId);
    if (!modulo) {
      throw new CustomError('Módulo não encontrado', 404);
    }

    // Verificar se todas as aulas pertencem ao módulo
    const aulasDoModulo = await aulaRepository.findByModuloId(moduloId);
    const idsAulasDoModulo = aulasDoModulo.map((a) => a.id);

    for (const { id } of aulasOrdenadas) {
      if (!idsAulasDoModulo.includes(id)) {
        throw new CustomError(`Aula ${id} não pertence ao módulo ${moduloId}`, 400);
      }
    }

    await aulaRepository.reorder(moduloId, aulasOrdenadas);
  }

  // === MÉTODOS DE PROGRESSO ===

  async marcarConcluida(aulaId: number, utilizadorId: number, tempoGasto?: number): Promise<any> {
    const aula = await aulaRepository.findById(aulaId);
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }

    return await aulaRepository.marcarConcluida(aulaId, utilizadorId, tempoGasto);
  }

  async desmarcarConcluida(aulaId: number, utilizadorId: number): Promise<any> {
    const aula = await aulaRepository.findById(aulaId);
    if (!aula) {
      throw new CustomError('Aula não encontrada', 404);
    }

    const resultado = await aulaRepository.desmarcarConcluida(aulaId, utilizadorId);
    if (!resultado) {
      throw new CustomError('Progresso não encontrado', 404);
    }

    return resultado;
  }

  async calcularProgressoCurso(
    cursoId: number,
    utilizadorId: number
  ): Promise<{ totalAulas: number; aulasConcluidas: number; percentual: number }> {
    return await aulaRepository.calcularProgressoCurso(cursoId, utilizadorId);
  }

  async getProgressoUtilizador(utilizadorId: number): Promise<any[]> {
    return await aulaRepository.findProgressoByUtilizador(utilizadorId);
  }

  // === MÉTODOS DE UPLOAD ===

  async uploadVideo(
    file: Buffer,
    cursoId: number,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    try {
      const url = await supabaseStorageService.uploadCourseContent(
        file,
        cursoId,
        fileName,
        mimeType
      );
      return url;
    } catch (error) {
      throw new CustomError('Erro ao fazer upload do vídeo', 500);
    }
  }

  async deleteVideoFromUrl(videoUrl: string): Promise<void> {
    try {
      await supabaseStorageService.deleteOldCourseContent(videoUrl);
    } catch (error) {
      // Log mas não falha - arquivo pode não existir mais
    }
  }
}

export const aulaService = new AulaService();
