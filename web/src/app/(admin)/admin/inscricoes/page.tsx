'use client';

import { useState, useEffect, useRef } from 'react';
import { useTodasInscricoesPaginadas, useAprovarInscricao, useRejeitarInscricao } from '@/hooks/queries/useInscricoes';
import { PageHeader } from '@/components/features/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TableSkeleton } from '@/components/TableSkeleton';
import { DataPagination } from '@/components/DataPagination';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useDebounce } from '@/hooks/useDebounce';
import { MoreHorizontal, CheckCircle2, XCircle, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EstadoInscricao } from '@/types';

const estadoBadgeVariant: Record<EstadoInscricao, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendente: 'outline',
  aceite: 'default',
  rejeitada: 'destructive',
  cancelada: 'secondary',
};

const estadoLabel: Record<EstadoInscricao, string> = {
  pendente: 'Pendente',
  aceite: 'Aceite',
  rejeitada: 'Rejeitada',
  cancelada: 'Cancelada',
};

export default function AdminInscricoesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [estadoFilter, setEstadoFilter] = useState<EstadoInscricao | 'todos'>('todos');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; inscricaoId: number | null }>({
    open: false,
    inscricaoId: null,
  });

  const aprovar = useAprovarInscricao();
  const rejeitar = useRejeitarInscricao();

  const { pagination, meta, setPage, setMeta } = useServerPagination(1, 10, 'dataInscricao', 'desc');

  const filtros = {
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(estadoFilter !== 'todos' && { estado: estadoFilter as EstadoInscricao }),
  };

  const { data: response, isLoading, isFetching } = useTodasInscricoesPaginadas(pagination, filtros);

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ search: debouncedSearchTerm, estado: estadoFilter });

  useEffect(() => {
    if (response?.meta) {
      setMeta(response.meta);
    }
  }, [response?.meta, setMeta]);

  // Reset to page 1 only when filters actually change
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.search !== debouncedSearchTerm ||
      prevFilters.estado !== estadoFilter;

    if (filtersChanged && pagination.page !== 1) {
      setPage(1);
    }

    prevFiltersRef.current = { search: debouncedSearchTerm, estado: estadoFilter };
  }, [debouncedSearchTerm, estadoFilter, pagination.page, setPage]);

  const handleAprovar = async (inscricaoId: number) => {
    if (window.confirm('Tem a certeza que deseja aprovar esta inscrição?')) {
      await aprovar.mutateAsync(inscricaoId);
    }
  };

  const handleRejeitar = async () => {
    if (rejectDialog.inscricaoId) {
      await rejeitar.mutateAsync({ id: rejectDialog.inscricaoId });
      setRejectDialog({ open: false, inscricaoId: null });
    }
  };

  const openRejectDialog = (inscricaoId: number) => {
    setRejectDialog({ open: true, inscricaoId });
  };

  const inscricoes = response?.data || [];

  // Get counts from metadata or calculate from current page
  const totalInscricoes = meta?.total || 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Gestão de Inscrições"
        description="Gerencie todas as inscrições de formandos nos cursos"
      />

      {/* Filters Card - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtrar inscrições por nome, email, curso ou estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={estadoFilter}
              onValueChange={(value) => setEstadoFilter(value as EstadoInscricao | 'todos')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aceite">Aceite</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Inscrições ({totalInscricoes})
            {isFetching && !isLoading && (
              <span className="text-sm font-normal text-muted-foreground">(atualizando...)</span>
            )}
          </CardTitle>
          <CardDescription>
            {meta ? `Total de ${meta.total} inscrições` : 'A carregar...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <TableSkeleton rows={10} columns={5} />
          ) : inscricoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma inscrição encontrada</p>
              <p className="text-sm text-muted-foreground">
                {estadoFilter !== 'todos' || searchTerm
                  ? 'Tente ajustar os filtros'
                  : 'Não há inscrições de momento.'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Formando</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscricoes.map((inscricao) => {
                      const nome = inscricao.utilizador?.nome || '';
                      const initials = nome
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <TableRow key={inscricao.id}>
                          <TableCell>
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={inscricao.utilizador?.avatar || undefined} alt={nome} />
                              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{inscricao.utilizador?.nome || 'Nome não disponível'}</span>
                              <span className="text-sm text-muted-foreground">{inscricao.utilizador?.email || 'Email não disponível'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{inscricao.curso?.nome || 'Curso não disponível'}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {inscricao.dataInscricao
                              ? format(new Date(inscricao.dataInscricao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : 'Data não disponível'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={estadoBadgeVariant[inscricao.estado]}>
                              {estadoLabel[inscricao.estado]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel></DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {inscricao.estado === 'pendente' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleAprovar(inscricao.id)}
                                      className="text-green-600 focus:text-green-600"
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Aprovar Inscrição
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openRejectDialog(inscricao.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Rejeitar Inscrição
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {inscricao.estado === 'aceite' && (
                                  <DropdownMenuItem disabled className="text-muted-foreground">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Já aprovada
                                  </DropdownMenuItem>
                                )}
                                {inscricao.estado === 'rejeitada' && (
                                  <DropdownMenuItem disabled className="text-muted-foreground">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Já rejeitada
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {meta && (
                <DataPagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  canGoPrevious={meta.hasPreviousPage}
                  canGoNext={meta.hasNextPage}
                  startIndex={(meta.page - 1) * meta.limit + 1}
                  endIndex={Math.min(meta.page * meta.limit, meta.total)}
                  totalItems={meta.total}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Inscrição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja rejeitar esta inscrição? O formando será notificado por email.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejeitar}
              className="bg-destructive hover:bg-destructive/90"
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
