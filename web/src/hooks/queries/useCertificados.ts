import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificadoService } from '@/services/certificado.service';
import type { Certificado } from '@/types';
import { toast } from 'sonner';

export const certificadoKeys = {
  all: ['certificados'] as const,
  lists: () => [...certificadoKeys.all, 'list'] as const,
  elegibilidade: (cursoId: number) => [...certificadoKeys.all, 'elegibilidade', cursoId] as const,
  validacao: (codigo: string) => [...certificadoKeys.all, 'validacao', codigo] as const,
};

export function useCertificados() {
  return useQuery({
    queryKey: certificadoKeys.lists(),
    queryFn: () => certificadoService.listarCertificados(),
  });
}

export function useElegibilidadeCertificado(cursoId: number) {
  return useQuery({
    queryKey: certificadoKeys.elegibilidade(cursoId),
    queryFn: () => certificadoService.verificarElegibilidade(cursoId),
    enabled: !!cursoId,
  });
}

export function useValidarCertificado(codigo: string) {
  return useQuery({
    queryKey: certificadoKeys.validacao(codigo),
    queryFn: () => certificadoService.validarCertificado(codigo),
    enabled: !!codigo && codigo.length > 0,
    retry: false, // Don't retry on validation failures
  });
}

export function useGerarCertificado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cursoId: number) => certificadoService.gerarCertificado(cursoId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: certificadoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificadoKeys.elegibilidade(variables) });
      toast.success('Certificado gerado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar certificado');
    },
  });
}

export function useDownloadCertificado() {
  return useMutation({
    mutationFn: ({ cursoId, cursoNome }: { cursoId: number; cursoNome: string }) =>
      certificadoService.downloadAndSave(cursoId, cursoNome),
    onSuccess: () => {
      toast.success('Certificado baixado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao baixar certificado');
    },
  });
}