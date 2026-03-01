import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/services/quiz.service';
import type { Quiz, CreateQuizInput, QuizSubmissao } from '@/types';
import { toast } from 'sonner';

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  listByAula: (aulaId: number) => [...quizKeys.lists(), 'aula', aulaId] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
  resolver: (id: number) => [...quizKeys.all, 'resolver', id] as const,
  tentativas: (id: number) => [...quizKeys.all, 'tentativas', id] as const,
  podeReitentar: (id: number) => [...quizKeys.all, 'pode-reitentar', id] as const,
};

export function useQuizzesPorAula(aulaId: number) {
  return useQuery({
    queryKey: quizKeys.listByAula(aulaId),
    queryFn: () => quizService.listarQuizzesPorAula(aulaId),
    enabled: !!aulaId,
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizService.obterQuiz(id),
    enabled: !!id,
  });
}

export function useQuizParaResolver(id: number) {
  return useQuery({
    queryKey: quizKeys.resolver(id),
    queryFn: () => quizService.obterQuizParaResolver(id),
    enabled: !!id,
  });
}

export function useTentativasQuiz(id: number) {
  return useQuery({
    queryKey: quizKeys.tentativas(id),
    queryFn: () => quizService.obterTentativasQuiz(id),
    enabled: !!id,
  });
}

export function usePodeReitentarQuiz(id: number) {
  return useQuery({
    queryKey: quizKeys.podeReitentar(id),
    queryFn: () => quizService.verificarPodeReitentar(id),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => quizService.criarQuiz(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.listByAula(data.aulaId) });
      toast.success('Quiz criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar quiz');
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateQuizInput> }) =>
      quizService.atualizarQuiz(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Quiz>(quizKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: quizKeys.listByAula(data.aulaId) });
      toast.success('Quiz atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar quiz');
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quizService.removerQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      toast.success('Quiz removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover quiz');
    },
  });
}

export function useSubmeterQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, respostas }: { id: number; respostas: QuizSubmissao['respostas'] }) =>
      quizService.submeterQuiz(id, respostas),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: quizKeys.tentativas(variables.id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.podeReitentar(variables.id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.resolver(variables.id) });

      // Show success message based on result
      if (data.aprovado) {
        toast.success(`Parabéns! Aprovado com nota ${data.nota}/20`);
      } else {
        if (data.podeReitentar) {
          toast.warning(`Não aprovado (${data.nota}/20). Ainda tem ${data.tentativasRestantes} tentativas.`);
        } else {
          toast.error(`Não aprovado (${data.nota}/20). Sem mais tentativas disponíveis.`);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao submeter quiz');
    },
  });
}