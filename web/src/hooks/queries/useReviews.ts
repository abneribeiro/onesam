import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type ReviewInput, type ReviewUpdate } from '@/services/review.service';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/errorHandler';

export function useReviewsPorCurso(cursoId: number) {
  return useQuery({
    queryKey: ['reviews', 'curso', cursoId],
    queryFn: () => reviewService.listarPorCurso(cursoId),
    enabled: !!cursoId,
  });
}

export function useReviewStats(cursoId: number) {
  return useQuery({
    queryKey: ['reviews', 'stats', cursoId],
    queryFn: () => reviewService.obterEstatisticas(cursoId),
    enabled: !!cursoId,
  });
}

export function useMinhaReview(cursoId: number) {
  return useQuery({
    queryKey: ['reviews', 'minha', cursoId],
    queryFn: () => reviewService.obterMinhaReview(cursoId),
    enabled: !!cursoId,
    retry: false, // Não retentar se não encontrar
    staleTime: 30000, // Cache por 30 segundos
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewInput) => reviewService.criar(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'curso', variables.IDCurso] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', variables.IDCurso] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'minha', variables.IDCurso] });
      toast.success('Avaliação criada com sucesso!');
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Erro ao criar avaliação');
      toast.error(message);
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewUpdate; cursoId: number }) =>
      reviewService.atualizar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'curso', variables.cursoId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', variables.cursoId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'minha', variables.cursoId] });
      toast.success('Avaliação atualizada com sucesso!');
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Erro ao atualizar avaliação');
      toast.error(message);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; cursoId: number }) => reviewService.deletar(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'curso', variables.cursoId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', variables.cursoId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'minha', variables.cursoId] });
      toast.success('Avaliação deletada com sucesso!');
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Erro ao deletar avaliação');
      toast.error(message);
    },
  });
}
