'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { PaginationParams, PaginationMeta } from '../types/pagination';

interface UseServerPaginationReturn {
  pagination: PaginationParams;
  meta: PaginationMeta | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setMeta: (meta: PaginationMeta) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function useServerPagination(
  initialPage: number = DEFAULT_PAGE,
  initialLimit: number = DEFAULT_LIMIT,
  initialSortBy?: string,
  initialSortOrder: 'asc' | 'desc' = 'desc'
): UseServerPaginationReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isUpdatingUrl = useRef(false);

  // Ler valores da URL
  const urlPage = Number(searchParams.get('page')) || initialPage;
  const urlLimit = Number(searchParams.get('limit')) || initialLimit;
  const urlSortBy = searchParams.get('sortBy') || initialSortBy;
  const urlSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || initialSortOrder;

  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Memoizar pagination para evitar re-renders desnecessários
  const pagination = useMemo<PaginationParams>(() => ({
    page: urlPage,
    limit: urlLimit,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
  }), [urlPage, urlLimit, urlSortBy, urlSortOrder]);

  // Função para atualizar URL de forma não-blocking usando replace
  const updateUrl = useCallback((updates: Partial<PaginationParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    isUpdatingUrl.current = true;
    // Usar replace ao invés de push para evitar navegação completa
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const setPage = useCallback((newPage: number) => {
    updateUrl({ page: newPage });
  }, [updateUrl]);

  const setLimit = useCallback((newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 });
  }, [updateUrl]);

  const setSortBy = useCallback((newSortBy: string) => {
    updateUrl({ sortBy: newSortBy });
  }, [updateUrl]);

  const setSortOrder = useCallback((newSortOrder: 'asc' | 'desc') => {
    updateUrl({ sortOrder: newSortOrder });
  }, [updateUrl]);

  const nextPage = useCallback(() => {
    if (meta && meta.hasNextPage) {
      setPage(urlPage + 1);
    }
  }, [meta, urlPage, setPage]);

  const previousPage = useCallback(() => {
    if (meta && meta.hasPreviousPage) {
      setPage(urlPage - 1);
    }
  }, [meta, urlPage, setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    if (meta) {
      setPage(meta.totalPages);
    }
  }, [meta, setPage]);

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
    setMeta(null);
  }, [router, pathname]);

  return {
    pagination,
    meta,
    setPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setMeta,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    reset,
  };
}
