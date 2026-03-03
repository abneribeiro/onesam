import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacaoService, NotificacaoError } from '../services/notificacao.service';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const NOTIFICATION_QUERY_KEYS = {
  all: ['notificacoes'] as const,
  count: ['notificacoes-nao-lidas-count'] as const,
} as const;

// Helper function to handle coordinated cache invalidation
const invalidateNotificationQueries = async (queryClient: any) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.count })
  ]);
};

// Helper function to handle different error types
const handleNotificationError = (error: unknown, defaultMessage: string) => {
  if (error instanceof NotificacaoError) {
    if (error.isAuthentication) {
      toast.error('Sessão expirada. Faça login novamente.');
      // Could redirect to login here
      return;
    }

    if (error.isPermission) {
      toast.error('Não tem permissão para realizar esta operação.');
      return;
    }

    if (error.isValidation) {
      const validationMessage = error.validationErrors
        .map(err => err.message)
        .join(', ');
      toast.error(`Dados inválidos: ${validationMessage}`);
      return;
    }

    if (error.isRateLimit) {
      toast.error('Muitas tentativas. Aguarde alguns minutos.');
      return;
    }
  }

  toast.error(defaultMessage);
};

export function useNotificacoes() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: notificacoes = [], isLoading, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.all,
    queryFn: () => notificacaoService.listarNotificacoes(),
    staleTime: 60000,
    gcTime: 300000, // 5 minutes
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry auth or permission errors
      if (error instanceof NotificacaoError) {
        if (error.isAuthentication || error.isPermission || error.isValidation) {
          return false;
        }
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const marcarComoLidaMutation = useMutation({
    mutationFn: (id: number) => notificacaoService.marcarComoLida(id),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
    },
    onError: (error) => {
      handleNotificationError(error, 'Erro ao marcar notificação como lida');
    },
    retry: (failureCount, error) => {
      if (error instanceof NotificacaoError) {
        // Don't retry validation, auth, or permission errors
        if (error.isValidation || error.isAuthentication || error.isPermission) {
          return false;
        }
        // Retry rate limit errors once after delay
        if (error.isRateLimit) {
          return failureCount < 1;
        }
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      if (error instanceof NotificacaoError && error.isRateLimit) {
        return 60000; // Wait 1 minute for rate limit
      }
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: () => notificacaoService.marcarTodasComoLidas(),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
      toast.success('Todas as notificações foram marcadas como lidas');
    },
    onError: (error) => {
      handleNotificationError(error, 'Erro ao marcar notificações como lidas');
    },
    retry: (failureCount, error) => {
      if (error instanceof NotificacaoError) {
        if (error.isValidation || error.isAuthentication || error.isPermission) {
          return false;
        }
        if (error.isRateLimit) {
          return failureCount < 1;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      if (error instanceof NotificacaoError && error.isRateLimit) {
        return 60000;
      }
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => notificacaoService.deletar(id),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
      toast.success('Notificação removida');
    },
    onError: (error) => {
      handleNotificationError(error, 'Erro ao remover notificação');
    },
    retry: (failureCount, error) => {
      if (error instanceof NotificacaoError) {
        if (error.isValidation || error.isAuthentication || error.isPermission) {
          return false;
        }
        if (error.isRateLimit) {
          return failureCount < 1;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      if (error instanceof NotificacaoError && error.isRateLimit) {
        return 60000;
      }
      return Math.min(1000 * 2 ** attemptIndex, 10000);
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
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.count,
    queryFn: () => notificacaoService.contarNaoLidas(),
    staleTime: 30000,
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000,
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry auth or permission errors
      if (error instanceof NotificacaoError) {
        if (error.isAuthentication || error.isPermission || error.isValidation) {
          return false;
        }
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    count: data?.count || 0,
    isLoading,
  };
}
