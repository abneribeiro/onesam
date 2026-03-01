import { apiService } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { KPIData, ConclusaoMensal, CursoAnalytics } from '../types';

class AnalyticsService {
  /**
   * Gets basic KPIs for the admin dashboard
   */
  async obterKPIs(): Promise<KPIData> {
    try {
      return await apiService.get<KPIData>('/admin/analytics/kpis');
    } catch (error: unknown) {
      return handleApiError(error, 'obter KPIs');
    }
  }

  /**
   * Gets monthly completion data for charts
   */
  async obterConclusoesMensais(): Promise<ConclusaoMensal[]> {
    try {
      return await apiService.get<ConclusaoMensal[]>('/admin/analytics/conclusoes');
    } catch (error: unknown) {
      return handleApiError(error, 'obter conclusões mensais');
    }
  }

  /**
   * Gets analytics data for each course
   */
  async obterAnalyticsCursos(): Promise<CursoAnalytics[]> {
    try {
      return await apiService.get<CursoAnalytics[]>('/admin/analytics/cursos');
    } catch (error: unknown) {
      return handleApiError(error, 'obter analytics dos cursos');
    }
  }

  /**
   * Downloads CSV export of enrollment data
   */
  async exportarCSV(): Promise<Blob> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/exportar`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao exportar dados');
      }

      return await response.blob();
    } catch (error: unknown) {
      return handleApiError(error, 'exportar dados');
    }
  }

  /**
   * Downloads CSV and triggers browser download
   */
  async downloadCSV(): Promise<void> {
    try {
      const blob = await this.exportarCSV();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-inscricoes-${new Date().toISOString().split('T')[0]}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      return handleApiError(error, 'fazer download do relatório');
    }
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;