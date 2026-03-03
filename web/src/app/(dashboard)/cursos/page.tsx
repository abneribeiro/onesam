'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardGridSkeleton } from '@/components/CardSkeleton';
import { DataPagination } from '@/components/DataPagination';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useSearchState } from '@/hooks/useSearchState';
import { useUrlState } from '@/hooks/useUrlState';
import { cursoService } from '@/services/curso.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CursoCard } from '@/components/features/CursoCard';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { areaService } from '@/services/area.service';
import { categoriaService } from '@/services/categoria.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CursoFiltros } from '@/types';
import { ScrollBlurWrapper } from '@/components/scrollBlurWrapper';

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use new URL state management hooks
  const { searchTerm, debouncedSearchTerm, handleSearchChange, clearSearch } = useSearchState(
    searchParams.get('search') || '',
    { pathname: '/cursos', debounceMs: 300 }
  );

  const { values: filterValues, updateState: updateFilter } = useUrlState(
    '/cursos',
    { area: 'all', categoria: 'all', nivel: 'all' },
    { resetPageOnChange: true }
  );

  const { pagination, meta, setPage, setMeta } = useServerPagination(1, 9, 'dataCriacao', 'desc');

  const filtros: CursoFiltros = {
    areaId: filterValues.area !== 'all' ? parseInt(filterValues.area) : undefined,
    categoriaId: filterValues.categoria !== 'all' ? parseInt(filterValues.categoria) : undefined,
    nivel: filterValues.nivel !== 'all' ? (filterValues.nivel as 'iniciante' | 'intermedio' | 'avancado') : undefined,
    estado: 'em_curso',
    search: debouncedSearchTerm || undefined,
  };

  const { data: response, isLoading: loadingCursos, isFetching } = useQuery({
    queryKey: ['cursos-catalog-paginated', pagination, filtros],
    queryFn: () => cursoService.listarCursosPaginados(pagination, filtros),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const { data: areas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areaService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriaService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef<{
    search: string;
    area: string;
    categoria: string;
    nivel: string;
  }>({
    search: '',
    area: 'all',
    categoria: 'all',
    nivel: 'all',
  });

  // Update ref after render to avoid stale closure bug
  useEffect(() => {
    prevFiltersRef.current = {
      search: debouncedSearchTerm,
      area: filterValues.area,
      categoria: filterValues.categoria,
      nivel: filterValues.nivel,
    };
  }, [debouncedSearchTerm, filterValues.area, filterValues.categoria, filterValues.nivel]);

  useEffect(() => {
    if (response?.meta) {
      setMeta(response.meta);
    }
  }, [response?.meta, setMeta]);

  // Reset to page 1 only when filters actually change
  const filterChangeCallback = useCallback(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.search !== debouncedSearchTerm ||
      prevFilters.area !== filterValues.area ||
      prevFilters.categoria !== filterValues.categoria ||
      prevFilters.nivel !== filterValues.nivel;

    if (filtersChanged && pagination.page !== 1) {
      setPage(1);
    }
  }, [debouncedSearchTerm, filterValues.area, filterValues.categoria, filterValues.nivel, pagination.page, setPage]);

  useEffect(() => {
    filterChangeCallback();
  }, [filterChangeCallback]);

  const activeFiltersCount = [
    filterValues.area !== 'all',
    filterValues.categoria !== 'all',
    filterValues.nivel !== 'all',
    searchTerm.length > 0
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    clearSearch();
    updateFilter({ area: 'all', categoria: 'all', nivel: 'all' });
  }, [clearSearch, updateFilter]);

  // Show initial loading only for areas/categories (static data)
  const initialLoading = loadingAreas || loadingCategorias;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo de Cursos</h1>
          <p className="text-muted-foreground">Explore e inscreva-se nos cursos disponiveis</p>
        </div>
      </div>

      {/* Filters Card - Always visible to prevent focus loss */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
              {isFetching && !loadingCursos && (
                <span className="text-sm font-normal text-muted-foreground ml-2">(atualizando...)</span>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search Input - always rendered */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Pesquisar cursos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
                aria-label="Pesquisar cursos"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={clearSearch}
                  aria-label="Limpar pesquisa"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={filterValues.area}
              onValueChange={(value) => updateFilter({ area: value })}
              disabled={initialLoading}
            >
              <SelectTrigger aria-label="Filtrar por area">
                <SelectValue placeholder="Todas as Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterValues.categoria}
              onValueChange={(value) => updateFilter({ categoria: value })}
              disabled={initialLoading}
            >
              <SelectTrigger aria-label="Filtrar por categoria">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterValues.nivel}
              onValueChange={(value) => updateFilter({ nivel: value })}
            >
              <SelectTrigger aria-label="Filtrar por nivel">
                <SelectValue placeholder="Todos os Niveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Niveis</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avancado">Avancado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {loadingCursos && !response ? (
        <CardGridSkeleton count={9} />
      ) : !response?.data || response.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Nenhum curso encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros para ver mais resultados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {meta?.total || 0} curso{(meta?.total || 0) !== 1 ? 's' : ''} encontrado{(meta?.total || 0) !== 1 ? 's' : ''}
          </div>
          <ScrollBlurWrapper minVelocity={20} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {response.data.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </ScrollBlurWrapper>
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
        </div>
      )}
    </div>
  );
}
