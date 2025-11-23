'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EstadoCursoBadge, NivelBadge } from '@/components/features/StatusBadge';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/TableSkeleton';
import { DataTableViewOptions } from '@/components/ui/data-table/data-table-view-options';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteCurso } from '@/hooks/queries';
import { cursoService } from '@/services/curso.service';
import { toast } from 'sonner';
import { MoreHorizontal, Eye, BookOpen, Pencil, Trash2 as TrashIcon, ArrowUpDown } from 'lucide-react';
import type { EstadoCurso, CursoComRelations } from '@/types';

export default function CursosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [estadoFilter, setEstadoFilter] = useState<EstadoCurso | 'todos'>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { pagination, meta, setPage, setMeta } = useServerPagination(1, 10, 'dataCriacao', 'desc');
  const deleteMutation = useDeleteCurso();

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { data: response, isLoading: loading, isFetching, refetch } = useQuery({
    queryKey: ['cursos-paginated', pagination, estadoFilter, debouncedSearchTerm],
    queryFn: () => cursoService.listarCursosPaginados(
      pagination,
      {
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(estadoFilter !== 'todos' && { estado: estadoFilter }),
      }
    ),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => cursoService.removerCursosEmMassa(ids),
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} curso(s) eliminado(s) com sucesso`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ['cursos-paginated'] });
    },
    onError: () => {
      toast.error('Erro ao eliminar cursos');
    },
  });

  const prevFiltersRef = useRef({ search: debouncedSearchTerm, estado: estadoFilter });

  useEffect(() => {
    if (response?.meta) {
      setMeta(response.meta);
    }
  }, [response?.meta, setMeta]);

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

  const handleDelete = () => {
    if (!cursoToDelete) return;

    deleteMutation.mutate(cursoToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setCursoToDelete(null);
        refetch();
      },
    });
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key as keyof typeof rowSelection])
      .map((key) => {
        const row = table.getRow(key);
        return row?.original?.id;
      })
      .filter((id): id is number => id !== undefined);

    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds);
      setBulkDeleteDialogOpen(false);
    }
  };

  // Define columns
  const columns: ColumnDef<CursoComRelations>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("nome")}</div>,
    },
    {
      accessorKey: "nivel",
      header: "Nivel",
      cell: ({ row }) => <NivelBadge nivel={row.getValue("nivel")} />,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => <EstadoCursoBadge estado={row.getValue("estado")} />,
    },
    {
      accessorKey: "cargaHoraria",
      header: "Carga Horaria",
      cell: ({ row }) => {
        const carga = row.getValue("cargaHoraria") as number | null;
        return <span>{carga ? `${carga}h` : "-"}</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right"></div>,
      cell: ({ row }) => {
        const curso = row.original;

        return (
          <div className="text-right">
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
                <DropdownMenuItem onClick={() => router.push(`/admin/cursos/${curso.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/cursos/${curso.id}/conteudo`)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Gerir Conteúdo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/cursos/${curso.id}/editar`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setCursoToDelete(curso.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [router]);

  const data = response?.data ?? [];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k as keyof typeof rowSelection]).length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os cursos da plataforma
          </p>
        </div>
        <Button onClick={() => router.push('/admin/cursos/criar')}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Curso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtrar cursos por nome e estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={estadoFilter}
              onValueChange={(value) => setEstadoFilter(value as EstadoCurso | 'todos')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="planeado">Planeado</SelectItem>
                <SelectItem value="em_curso">Em Curso</SelectItem>
                <SelectItem value="terminado">Terminado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Cursos ({meta?.total || 0})
                {isFetching && !loading && (
                  <span className="text-sm font-normal text-muted-foreground">(atualizando...)</span>
                )}
              </CardTitle>
              <CardDescription>
                {meta ? `Total de ${meta.total} cursos` : 'Carregando...'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar ({selectedCount})
                </Button>
              )}
              <DataTableViewOptions table={table} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">Nenhum curso encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {estadoFilter !== 'todos'
                  ? 'Tente ajustar os filtros'
                  : 'Comece criando o primeiro curso'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Nenhum resultado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedCount > 0 ? (
                    <span>{selectedCount} de {data.length} linha(s) selecionada(s).</span>
                  ) : (
                    <span>Total de {data.length} linha(s).</span>
                  )}
                </div>
                {meta && (
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center justify-center text-sm font-medium">
                      Página {meta.page} de {meta.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(meta.page - 1)}
                        disabled={!meta.hasPreviousPage}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(meta.page + 1)}
                        disabled={!meta.hasNextPage}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O curso será permanentemente eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {selectedCount} curso(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os cursos selecionados serão permanentemente eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'A eliminar...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
