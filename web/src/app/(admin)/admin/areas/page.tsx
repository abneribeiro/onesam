'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, ArrowUpDown, Search, FolderOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { TableSkeleton } from '@/components/TableSkeleton';
import { DataTableViewOptions } from '@/components/ui/data-table/data-table-view-options';
import { DataPagination } from '@/components/DataPagination';
import { useDebounce } from '@/hooks/useDebounce';
import type { AreaBase } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '@/hooks/queries/useAreas';
import { areaService } from '@/services/area.service';
import { toast } from 'sonner';

const areaSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  descricao: z.string().optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

const PAGE_SIZE = 10;

export default function AreasList() {
  const { data: areas = [], isLoading } = useAreas();
  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const deleteMutation = useDeleteArea();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaBase | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Track previous search value to detect changes
  const prevSearchRef = useRef(debouncedSearchTerm);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
    prevSearchRef.current = debouncedSearchTerm;
  }, [debouncedSearchTerm, currentPage]);

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => areaService.deleteMany(ids),
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} area(s) eliminada(s) com sucesso`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: () => {
      toast.error('Erro ao eliminar areas');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
  });

  // Filter data based on search
  const filteredAreas = useMemo(() => {
    if (!debouncedSearchTerm) return areas;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return areas.filter(
      (area) =>
        area.nome.toLowerCase().includes(searchLower) ||
        (area.descricao && area.descricao.toLowerCase().includes(searchLower))
    );
  }, [areas, debouncedSearchTerm]);

  // Paginate filtered data
  const paginatedAreas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAreas.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAreas, currentPage]);

  // Pagination metadata
  const totalPages = Math.ceil(filteredAreas.length / PAGE_SIZE);
  const startIndex = filteredAreas.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredAreas.length);

  const handleOpenDialog = (area?: AreaBase) => {
    if (area) {
      setEditingArea(area);
      reset({
        nome: area.nome,
        descricao: area.descricao || '',
      });
    } else {
      setEditingArea(null);
      reset({
        nome: '',
        descricao: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingArea(null);
    reset();
  };

  const onSubmit = async (data: AreaFormValues) => {
    if (editingArea) {
      await updateMutation.mutateAsync({ id: editingArea.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (!areaToDelete) return;

    await deleteMutation.mutateAsync(areaToDelete);
    setDeleteDialogOpen(false);
    setAreaToDelete(null);
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

  const columns: ColumnDef<AreaBase>[] = useMemo(() => [
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
      accessorKey: "descricao",
      header: "Descricao",
      cell: ({ row }) => <span>{row.getValue("descricao") || '-'}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right"></div>,
      cell: ({ row }) => {
        const area = row.original;

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
                <DropdownMenuItem onClick={() => handleOpenDialog(area)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setAreaToDelete(area.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: paginatedAreas,
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
          <h1 className="text-3xl font-bold tracking-tight">Áreas</h1>
          <p className="text-muted-foreground">
            Gerencie as áreas de formação
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Área
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Pesquisar áreas por nome ou descrição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Áreas ({filteredAreas.length})</CardTitle>
              <CardDescription>
                {filteredAreas.length === areas.length
                  ? `Total de ${areas.length} áreas registadas`
                  : `${filteredAreas.length} de ${areas.length} áreas`}
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
          {isLoading ? (
            <TableSkeleton rows={10} columns={4} />
          ) : filteredAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma área encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? 'Tente ajustar a pesquisa'
                  : 'Comece criando a primeira área'}
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
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                canGoPrevious={currentPage > 1}
                canGoNext={currentPage < totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredAreas.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? 'Editar Área' : 'Nova Área'}</DialogTitle>
            <DialogDescription>
              {editingArea
                ? 'Atualize os dados da área'
                : 'Preencha os dados para criar uma nova área'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nome">Nome *</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: Tecnologias da Informação"
                  disabled={isSubmitting}
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da área (opcional)"
                  rows={3}
                  disabled={isSubmitting}
                  {...register('descricao')}
                />
                {errors.descricao && (
                  <p className="text-sm text-destructive">{errors.descricao.message}</p>
                )}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A guardar...' : editingArea ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A área será permanentemente eliminada.
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
            <AlertDialogTitle>Eliminar {selectedCount} area(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As áreas selecionadas serão permanentemente eliminadas.
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
