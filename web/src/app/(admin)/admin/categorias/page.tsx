'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, ArrowUpDown, Search, Tags } from 'lucide-react';
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
import type { CategoriaBase } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/queries/useCategorias';
import { useAreas } from '@/hooks/queries/useAreas';
import { categoriaService } from '@/services/categoria.service';
import { toast } from 'sonner';

const categoriaSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  descricao: z.string().optional(),
  IDArea: z.number().min(1, { message: 'Selecione uma área' }),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

const PAGE_SIZE = 10;

export default function CategoriasList() {
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias();
  const { data: areas = [], isLoading: loadingAreas } = useAreas();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaBase | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<number | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [areaFilter, setAreaFilter] = useState<string>('todas');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ search: debouncedSearchTerm, area: areaFilter });

  const loading = loadingCategorias || loadingAreas;

  // Reset to page 1 when filters change
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.search !== debouncedSearchTerm ||
      prevFilters.area !== areaFilter;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    prevFiltersRef.current = { search: debouncedSearchTerm, area: areaFilter };
  }, [debouncedSearchTerm, areaFilter, currentPage]);

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => categoriaService.deleteMany(ids),
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} categoria(s) eliminada(s) com sucesso`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: () => {
      toast.error('Erro ao eliminar categorias');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
  });

  const handleOpenDialog = (categoria?: CategoriaBase) => {
    if (categoria) {
      setEditingCategoria(categoria);
      reset({
        nome: categoria.nome,
        descricao: categoria.descricao || '',
        IDArea: categoria.areaId || 0,
      });
    } else {
      setEditingCategoria(null);
      reset({
        nome: '',
        descricao: '',
        IDArea: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategoria(null);
    reset();
  };

  const onSubmit = async (data: CategoriaFormValues) => {
    if (editingCategoria) {
      await updateMutation.mutateAsync({ id: editingCategoria.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (!categoriaToDelete) return;

    await deleteMutation.mutateAsync(categoriaToDelete);
    setDeleteDialogOpen(false);
    setCategoriaToDelete(null);
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

  const getAreaNome = (areaId: number | null) => {
    if (!areaId) return '-';
    const area = areas.find(a => a.id === areaId);
    return area?.nome || '-';
  };

  // Filter data based on search and area filter
  const filteredCategorias = useMemo(() => {
    let filtered = [...categorias];

    // Apply area filter
    if (areaFilter !== 'todas') {
      filtered = filtered.filter(c => c.areaId === parseInt(areaFilter));
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (categoria) =>
          categoria.nome.toLowerCase().includes(searchLower) ||
          (categoria.descricao && categoria.descricao.toLowerCase().includes(searchLower)) ||
          getAreaNome(categoria.areaId).toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [categorias, areaFilter, debouncedSearchTerm, areas]);

  // Paginate filtered data
  const paginatedCategorias = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCategorias.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCategorias, currentPage]);

  // Pagination metadata
  const totalPages = Math.ceil(filteredCategorias.length / PAGE_SIZE);
  const startIndex = filteredCategorias.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredCategorias.length);

  const columns: ColumnDef<CategoriaBase>[] = useMemo(() => [
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
      accessorKey: "areaId",
      header: "Area",
      cell: ({ row }) => <span>{getAreaNome(row.getValue("areaId"))}</span>,
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
        const categoria = row.original;

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
                <DropdownMenuItem onClick={() => handleOpenDialog(categoria)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setCategoriaToDelete(categoria.id);
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
  ], [areas]);

  const table = useReactTable({
    data: paginatedCategorias,
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
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de cursos
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Pesquisar categorias por nome, descrição ou área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, descrição ou área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={areaFilter}
              onValueChange={setAreaFilter}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categorias ({filteredCategorias.length})</CardTitle>
              <CardDescription>
                {filteredCategorias.length === categorias.length
                  ? `Total de ${categorias.length} categorias`
                  : `${filteredCategorias.length} de ${categorias.length} categorias`}
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
            <TableSkeleton rows={10} columns={5} />
          ) : filteredCategorias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tags className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || areaFilter !== 'todas'
                  ? 'Tente ajustar os filtros'
                  : 'Comece criando a primeira categoria'}
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
                totalItems={filteredCategorias.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategoria
                ? 'Atualize os dados da categoria'
                : 'Preencha os dados para criar uma nova categoria'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nome">Nome *</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: Programação Web"
                  disabled={isSubmitting}
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="IDArea">Área *</FieldLabel>
                <Select
                  onValueChange={(value) => setValue('IDArea', parseInt(value))}
                  defaultValue={editingCategoria?.areaId?.toString()}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="IDArea">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.IDArea && (
                  <p className="text-sm text-destructive">{errors.IDArea.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da categoria (opcional)"
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
                {isSubmitting ? 'A guardar...' : editingCategoria ? 'Atualizar' : 'Criar'}
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
              Esta ação não pode ser desfeita. A categoria será permanentemente eliminada.
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
            <AlertDialogTitle>Eliminar {selectedCount} categoria(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As categorias selecionadas serão permanentemente eliminadas.
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
