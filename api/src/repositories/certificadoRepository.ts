import { eq, and } from 'drizzle-orm';
import { db } from '../database/db';
import { certificados } from '../database/schema';
import type { Certificado, NewCertificado } from '../types';

export class CertificadoRepository {
  async create(data: NewCertificado): Promise<Certificado> {
    const [certificado] = await db.insert(certificados).values(data).returning();
    return certificado;
  }

  async findById(id: number): Promise<Certificado | undefined> {
    return await db.query.certificados.findFirst({
      where: eq(certificados.id, id)
    });
  }

  async findByHash(codigoHash: string): Promise<Certificado | undefined> {
    return await db.query.certificados.findFirst({
      where: eq(certificados.codigoHash, codigoHash)
    });
  }

  async findByUserId(utilizadorId: number): Promise<Certificado[]> {
    return await db.query.certificados.findMany({
      where: eq(certificados.utilizadorId, utilizadorId),
      with: {
        curso: true
      }
    });
  }

  async findByCourseId(cursoId: number): Promise<Certificado[]> {
    return await db.query.certificados.findMany({
      where: eq(certificados.cursoId, cursoId),
      with: {
        utilizador: true
      }
    });
  }

  async findByUserAndCourse(utilizadorId: number, cursoId: number): Promise<Certificado | undefined> {
    return await db.query.certificados.findFirst({
      where: and(
        eq(certificados.utilizadorId, utilizadorId),
        eq(certificados.cursoId, cursoId)
      )
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(certificados).where(eq(certificados.id, id)).returning();
    return result.length > 0;
  }
}

export const certificadoRepository = new CertificadoRepository();