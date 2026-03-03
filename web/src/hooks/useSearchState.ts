'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from './useDebounce';

export interface UseSearchStateOptions {
  pathname: string;
  debounceMs?: number;
}

export function useSearchState(
  initialSearch: string,
  options: UseSearchStateOptions
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pathname, debounceMs = 300 } = options;

  // Local search state (what user types)
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Track if user is actively typing to prevent URL sync conflicts
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update URL when debounced search changes (single source of truth: local state → URL)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (debouncedSearchTerm !== urlSearch) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set('search', debouncedSearchTerm);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  // Sync local state from URL when navigating (only when not typing)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchTerm && !isTypingRef.current) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setSearchTerm(urlSearch);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, searchTerm]);

  // Handle search input changes with typing state management
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    setSearchTerm(e.target.value);

    // Clean up previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset typing flag after debounce + buffer
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, debounceMs + 50);
  }, [debounceMs]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    handleSearchChange,
    clearSearch,
  };
}