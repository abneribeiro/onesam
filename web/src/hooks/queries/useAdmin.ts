import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  cursosPopulares: (limit: number) => [...adminKeys.all, 'cursosPopulares', limit] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.obterEstatisticas(),
    staleTime: 60000, // 1 minuto
  });
}

export function useCursosPopulares(limit: number = 5) {
  return useQuery({
    queryKey: adminKeys.cursosPopulares(limit),
    queryFn: () => adminService.obterCursosMaisPopulares(limit),
    staleTime: 60000, // 1 minuto
  });
}
