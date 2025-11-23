import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '@/services/area.service';
import type { AreaBase } from '@/types';
import { toast } from 'sonner';

interface CreateAreaInput {
  nome: string;
  descricao?: string;
}

interface UpdateAreaInput {
  nome?: string;
  descricao?: string;
}

export const areaKeys = {
  all: ['areas'] as const,
  lists: () => [...areaKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...areaKeys.lists(), filters] as const,
  details: () => [...areaKeys.all, 'detail'] as const,
  detail: (id: number) => [...areaKeys.details(), id] as const,
};

export function useAreas() {
  return useQuery({
    queryKey: areaKeys.lists(),
    queryFn: () => areaService.getAll(),
  });
}

export function useArea(id: number) {
  return useQuery({
    queryKey: areaKeys.detail(id),
    queryFn: () => areaService.getById(id),
    enabled: !!id,
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAreaInput) => areaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
      toast.success('Área criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar área');
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAreaInput }) =>
      areaService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<AreaBase>(areaKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
      toast.success('Área atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar área');
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => areaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
      toast.success('Área eliminada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao eliminar área');
    },
  });
}
