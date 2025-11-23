'use client';

export const dynamic = 'force-dynamic';


import { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/TableSkeleton';
import { DataPagination } from '@/components/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/features/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useMinhasInscricoes, useCancelarInscricao } from '@/hooks/queries';
import { formatDate } from '@/lib/dateUtils';

export default function MinhasInscricoes() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [inscricaoToCancel, setInscricaoToCancel] = useState<number | null>(null);

  const { data: inscricoes = [], isLoading: loading } = useMinhasInscricoes();
  const cancelarMutation = useCancelarInscricao();

  const pagination = usePagination({
    data: inscricoes,
    itemsPerPage: 10,
  });

  const handleCancelar = () => {
    if (!inscricaoToCancel) return;

    cancelarMutation.mutate(inscricaoToCancel, {
      onSuccess: () => {
        setCancelDialogOpen(false);
        setInscricaoToCancel(null);
      },
    });
  };

  const stats = useMemo(
    () => ({
      total: inscricoes.length,
      aceites: inscricoes.filter((i) => i.estado === 'aceite').length,
      pendentes: inscricoes.filter((i) => i.estado === 'pendente').length,
      rejeitadas: inscricoes.filter((i) => i.estado === 'rejeitada').length,
    }),
    [inscricoes]
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Inscrições</h1>
          <p className="text-muted-foreground">Gerencie as suas inscrições em cursos</p>
        </div>
        <Link href="/cursos">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Explorar Mais Cursos
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todas as inscrições</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aceites</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--success-600)]">{stats.aceites}</div>
            <p className="text-xs text-muted-foreground">Inscrições aprovadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--warning-600)]">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">A aguardar aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--error-600)]">{stats.rejeitadas}</div>
            <p className="text-xs text-muted-foreground">Não aprovadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Inscrições ({inscricoes.length})</CardTitle>
          <CardDescription>
            Histórico completo das suas inscrições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <TableSkeleton rows={10} columns={4} />
          ) : inscricoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma inscrição encontrada</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Comece explorando o catálogo de cursos
              </p>
              <Link href="/cursos">
                <Button>Explorar Cursos</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((inscricao) => (
                    <TableRow key={inscricao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inscricao.curso?.nome || 'Curso Desconhecido'}</div>
                          <div className="text-sm text-muted-foreground">
                            {inscricao.curso?.descricao?.substring(0, 60)}
                            {inscricao.curso?.descricao && inscricao.curso.descricao.length > 60 ? '...' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(inscricao.dataInscricao)}</TableCell>
                      <TableCell><EstadoBadge estado={inscricao.estado} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inscricao.estado === 'aceite' && (
                            <Link href={`/cursos/${inscricao.cursoId}`}>
                              <Button size="sm" variant="outline">
                                Acessar Curso
                              </Button>
                            </Link>
                          )}
                          {(inscricao.estado === 'pendente' || inscricao.estado === 'aceite') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setInscricaoToCancel(inscricao.id);
                                setCancelDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DataPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              canGoPrevious={pagination.canGoPrevious}
              canGoNext={pagination.canGoNext}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              totalItems={pagination.totalItems}
            />
          </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Inscrição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja cancelar esta inscrição? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar} className="bg-destructive text-destructive-foreground">
              Cancelar Inscrição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
