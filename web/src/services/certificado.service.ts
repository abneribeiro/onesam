import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { Certificado } from '../types';

class CertificadoService {
  /**
   * Downloads certificate PDF for a course
   */
  async downloadCertificado(cursoId: number): Promise<Blob> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificados/download/${cursoId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao baixar certificado');
      }

      return await response.blob();
    } catch (error: unknown) {
      return handleApiError(error, 'baixar certificado');
    }
  }

  /**
   * Checks if user can generate certificate for a course
   */
  async verificarElegibilidade(cursoId: number): Promise<{ podeGerar: boolean }> {
    try {
      return await apiService.get<{ podeGerar: boolean }>(`/certificados/elegibilidade/${cursoId}`);
    } catch (error: unknown) {
      return handleApiError(error, 'verificar elegibilidade para certificado');
    }
  }

  /**
   * Generates certificate for a course
   */
  async gerarCertificado(cursoId: number): Promise<Certificado> {
    try {
      return await apiService.post<Certificado>(`/certificados/gerar/${cursoId}`, {});
    } catch (error: unknown) {
      return handleApiError(error, 'gerar certificado');
    }
  }

  /**
   * Lists user's certificates
   */
  async listarCertificados(): Promise<Certificado[]> {
    try {
      return await apiService.get<Certificado[]>('/certificados');
    } catch (error: unknown) {
      return handleApiError(error, 'listar certificados');
    }
  }

  /**
   * Validates a certificate by code (public endpoint)
   */
  async validarCertificado(codigo: string): Promise<{
    utilizadorNome: string;
    cursoNome: string;
    dataEmissao: string;
    codigoHash: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificados/validar/${codigo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Certificado não encontrado');
      }

      return await response.json();
    } catch (error: unknown) {
      return handleApiError(error, 'validar certificado');
    }
  }

  /**
   * Downloads certificate and triggers browser download
   */
  async downloadAndSave(cursoId: number, cursoNome: string): Promise<void> {
    try {
      const blob = await this.downloadCertificado(cursoId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificado - ${cursoNome}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      return handleApiError(error, 'fazer download do certificado');
    }
  }
}

export const certificadoService = new CertificadoService();
export default CertificadoService;