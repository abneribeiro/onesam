import { useMutation, useQueryClient } from '@tanstack/react-query';
import { utilizadorService } from '@/services/utilizador.service';
import type { Utilizador } from '@/types';
import { toast } from 'sonner';

interface UpdatePerfilInput {
  nome?: string;
  email?: string;
  localizacao?: string;
}

interface AlterarSenhaInput {
  senhaAtual: string;
  novaSenha: string;
}

export function useUpdatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePerfilInput) => utilizadorService.atualizarPerfil(data),
    onSuccess: (data) => {
      queryClient.setQueryData<Utilizador>(['auth', 'currentUser'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      utilizadorService.uploadAvatar(file, onProgress),
    onSuccess: (data) => {
      queryClient.setQueryData<Utilizador>(['auth', 'currentUser'], (old) =>
        old ? { ...old, avatar: data.avatarUrl } : old
      );
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
      toast.success('Avatar atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fazer upload do avatar');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: AlterarSenhaInput) => utilizadorService.alterarSenha(data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao alterar senha');
    },
  });
}
