'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PerfilBadge } from '@/components/features/PerfilBadge';
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
import { utilizadorService } from '@/services/utilizador.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoPerfil, Utilizador } from '@/types';

export default function UtilizadoresList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [perfilFilter, setPerfilFilter] = useState<TipoPerfil | 'todos'>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [utilizadorToDelete, setUtilizadorToDelete] = useState<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { pagination, meta, setPage, setMeta } = useServerPagination(1, 10, 'dataCriacao', 'desc');

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Track previous filter values to detect actual changes
  const prevFiltersRef = useRef({ search: debouncedSearchTerm, perfil: perfilFilter });

  const { data: response, isLoading: loading, isFetching, refetch } = useQuery({
    queryKey: ['utilizadores-paginated', pagination],
    queryFn: () => utilizadorService.getAllPaginated(pagination),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => utilizadorService.deleteMany(ids),
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} utilizador(es) eliminado(s) com sucesso`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ['utilizadores-paginated'] });
    },
    onError: () => {
      toast.error('Erro ao eliminar utilizadores');
    },
  });

  const filteredData = useMemo(() => {
    if (!response?.data) return [];

    let filtered = [...response.data];

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    if (perfilFilter !== 'todos') {
      filtered = filtered.filter((u) => u.tipoPerfil === perfilFilter);
    }

    return filtered;
  }, [response?.data, debouncedSearchTerm, perfilFilter]);

  useEffect(() => {
    if (response?.meta) {
      setMeta(response.meta);
    }
  }, [response, setMeta]);

  // Reset to page 1 only when filters actually change
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.search !== debouncedSearchTerm ||
      prevFilters.perfil !== perfilFilter;

    if (filtersChanged && pagination.page !== 1) {
      setPage(1);
    }

    prevFiltersRef.current = { search: debouncedSearchTerm, perfil: perfilFilter };
  }, [debouncedSearchTerm, perfilFilter, pagination.page, setPage]);

  const handleDelete = async () => {
    if (!utilizadorToDelete) return;

    try {
      await utilizadorService.delete(utilizadorToDelete);
      toast.success('Utilizador eliminado com sucesso');
      refetch();
    } catch {
      toast.error('Erro ao eliminar utilizador');
    } finally {
      setDeleteDialogOpen(false);
      setUtilizadorToDelete(null);
    }
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

  const columns: ColumnDef<Utilizador>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => {
        // Calcular se todas as linhas selecionáveis (excluindo o próprio admin) estão selecionadas
        const selectableRows = table.getRowModel().rows.filter(row => row.original.id !== currentUser?.id);
        const allSelectableSelected = selectableRows.length > 0 && selectableRows.every(row => row.getIsSelected());
        const someSelectableSelected = selectableRows.some(row => row.getIsSelected());

        return (
          <Checkbox
            checked={allSelectableSelected || (someSelectableSelected && "indeterminate")}
            onCheckedChange={(value) => {
              // Apenas selecionar/deselecionar linhas que não são o próprio admin
              selectableRows.forEach(row => row.toggleSelected(!!value));
            }}
            aria-label="Selecionar todos"
          />
        );
      },
      cell: ({ row }) => {
        const isCurrentUser = row.original.id === currentUser?.id;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={isCurrentUser}
            aria-label={isCurrentUser ? "Não é possível selecionar o próprio utilizador" : "Selecionar linha"}
            title={isCurrentUser ? "Não é possível selecionar o próprio utilizador" : undefined}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const utilizador = row.original;
        const initials = utilizador.nome
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <Avatar className="h-9 w-9">
            <AvatarImage src={utilizador.avatar || undefined} alt={utilizador.nome} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        );
      },
      enableSorting: false,
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
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "tipoPerfil",
      header: "Perfil",
      cell: ({ row }) => <PerfilBadge perfil={row.getValue("tipoPerfil")} />,
    },
    {
      accessorKey: "ativo",
      header: "Estado",
      cell: ({ row }) => {
        const ativo = row.getValue("ativo") as boolean;
        return (
          <Badge variant={ativo ? 'default' : 'secondary'} className={ativo ? 'bg-[var(--success-500)]' : ''}>
            {ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right"></div>,
      cell: ({ row }) => {
        const utilizador = row.original;
        const isCurrentUser = utilizador.id === currentUser?.id;

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
                <DropdownMenuItem onClick={() => router.push(`/admin/utilizadores/${utilizador.id}/editar`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (!isCurrentUser) {
                      setUtilizadorToDelete(utilizador.id);
                      setDeleteDialogOpen(true);
                    }
                  }}
                  className={isCurrentUser ? "text-muted-foreground cursor-not-allowed" : "text-destructive focus:text-destructive"}
                  disabled={isCurrentUser}
                  title={isCurrentUser ? "Não é possível eliminar o próprio utilizador" : undefined}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isCurrentUser ? "Eliminar (você)" : "Eliminar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [router, currentUser]);

  const table = useReactTable({
    data: filteredData,
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
          <h1 className="text-3xl font-bold tracking-tight">Utilizadores</h1>
          <p className="text-muted-foreground">
            Gerencie todos os utilizadores da plataforma
          </p>
        </div>
        <Button onClick={() => router.push('/admin/utilizadores/criar')}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Utilizador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtrar utilizadores por nome, email ou perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={perfilFilter}
              onValueChange={(value) => setPerfilFilter(value as TipoPerfil | 'todos')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="formando">Formando</SelectItem>
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
                Utilizadores ({meta?.total || 0})
                {isFetching && !loading && (
                  <span className="text-sm font-normal text-muted-foreground">(atualizando...)</span>
                )}
              </CardTitle>
              <CardDescription>
                {meta ? `Total de ${meta.total} utilizadores` : 'Carregando...'}
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
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">Nenhum utilizador encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || perfilFilter !== 'todos'
                  ? 'Tente ajustar os filtros'
                  : 'Comece criando o primeiro utilizador'}
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
                    <span>{selectedCount} de {filteredData.length} linha(s) selecionada(s).</span>
                  ) : (
                    <span>Total de {filteredData.length} linha(s).</span>
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
              Esta ação não pode ser desfeita. O utilizador será permanentemente eliminado.
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
            <AlertDialogTitle>Eliminar {selectedCount} utilizador(es)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os utilizadores selecionados serão permanentemente eliminados.
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
