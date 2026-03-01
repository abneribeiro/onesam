import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { toast } from 'sonner';

export const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: () => [...analyticsKeys.all, 'kpis'] as const,
  conclusoes: () => [...analyticsKeys.all, 'conclusoes'] as const,
  cursos: () => [...analyticsKeys.all, 'cursos'] as const,
};

export function useAnalyticsKPIs() {
  return useQuery({
    queryKey: analyticsKeys.kpis(),
    queryFn: () => analyticsService.obterKPIs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAnalyticsConclusoes() {
  return useQuery({
    queryKey: analyticsKeys.conclusoes(),
    queryFn: () => analyticsService.obterConclusoesMensais(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAnalyticsCursos() {
  return useQuery({
    queryKey: analyticsKeys.cursos(),
    queryFn: () => analyticsService.obterAnalyticsCursos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useExportCSV() {
  return useMutation({
    mutationFn: () => analyticsService.downloadCSV(),
    onSuccess: () => {
      toast.success('Relatório exportado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao exportar relatório');
    },
  });
}