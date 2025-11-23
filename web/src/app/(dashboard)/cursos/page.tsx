'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardGridSkeleton } from '@/components/CardSkeleton';
import { DataPagination } from '@/components/DataPagination';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useDebounce } from '@/hooks/useDebounce';
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

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search from URL
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Track if user is typing to avoid URL update conflicts
  const isTypingRef = useRef(false);

  const selectedArea = searchParams.get('area') || 'all';
  const selectedCategoria = searchParams.get('categoria') || 'all';
  const selectedNivel = searchParams.get('nivel') || 'all';

  const { pagination, meta, setPage, setMeta } = useServerPagination(1, 9, 'dataCriacao', 'desc');

  // Update URL when debounced search changes
  useEffect(() => {
    // Only update URL if the debounced value differs from URL
    const urlSearch = searchParams.get('search') || '';
    if (debouncedSearchTerm !== urlSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set('search', debouncedSearchTerm);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.replace(`/cursos?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, router, searchParams]);

  // Sync searchTerm with URL when navigating (but not while typing)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchTerm && !isTypingRef.current) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const updateSearchParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.replace(`/cursos?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const filtros: CursoFiltros = {
    areaId: selectedArea !== 'all' ? parseInt(selectedArea) : undefined,
    categoriaId: selectedCategoria !== 'all' ? parseInt(selectedCategoria) : undefined,
    nivel: selectedNivel !== 'all' ? (selectedNivel as 'iniciante' | 'intermedio' | 'avancado') : undefined,
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
  const prevFiltersRef = useRef({
    search: debouncedSearchTerm,
    area: selectedArea,
    categoria: selectedCategoria,
    nivel: selectedNivel,
  });

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
      prevFilters.area !== selectedArea ||
      prevFilters.categoria !== selectedCategoria ||
      prevFilters.nivel !== selectedNivel;

    if (filtersChanged && pagination.page !== 1) {
      setPage(1);
    }

    prevFiltersRef.current = {
      search: debouncedSearchTerm,
      area: selectedArea,
      categoria: selectedCategoria,
      nivel: selectedNivel,
    };
  }, [debouncedSearchTerm, selectedArea, selectedCategoria, selectedNivel, pagination.page, setPage]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    setSearchTerm(e.target.value);
    // Reset typing flag after debounce
    setTimeout(() => {
      isTypingRef.current = false;
    }, 350);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.replace(`/cursos?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const activeFiltersCount = [
    selectedArea !== 'all',
    selectedCategoria !== 'all',
    selectedNivel !== 'all',
    searchTerm.length > 0
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    router.replace('/cursos?page=1', { scroll: false });
  }, [router]);

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
                  onClick={handleClearSearch}
                  aria-label="Limpar pesquisa"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={selectedArea}
              onValueChange={(value) => updateSearchParam('area', value)}
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
              value={selectedCategoria}
              onValueChange={(value) => updateSearchParam('categoria', value)}
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
              value={selectedNivel}
              onValueChange={(value) => updateSearchParam('nivel', value)}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {response.data.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
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
        </div>
      )}
    </div>
  );
}
