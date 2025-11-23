import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacaoService } from '../services/notificacao.service';
import { toast } from 'sonner';

export function useNotificacoes() {
  const queryClient = useQueryClient();

  const { data: notificacoes = [], isLoading, refetch } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => notificacaoService.listarNotificacoes(),
    staleTime: 60000,
  });

  const marcarComoLidaMutation = useMutation({
    mutationFn: (id: number) => notificacaoService.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-nao-lidas-count'] });
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida');
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: () => notificacaoService.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-nao-lidas-count'] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
    onError: () => {
      toast.error('Erro ao marcar notificações como lidas');
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => notificacaoService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-nao-lidas-count'] });
      toast.success('Notificação removida');
    },
    onError: () => {
      toast.error('Erro ao remover notificação');
    },
  });

  return {
    notificacoes,
    isLoading,
    refetch,
    marcarComoLida: marcarComoLidaMutation.mutate,
    marcarTodasComoLidas: marcarTodasComoLidasMutation.mutate,
    deletar: deletarMutation.mutate,
    isMarking: marcarComoLidaMutation.isPending || marcarTodasComoLidasMutation.isPending,
    isDeleting: deletarMutation.isPending,
  };
}

export function useNotificacoesNaoLidasCount() {
  const { data, isLoading } = useQuery({
    queryKey: ['notificacoes-nao-lidas-count'],
    queryFn: () => notificacaoService.contarNaoLidas(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    count: data?.count || 0,
    isLoading,
  };
}
