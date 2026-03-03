'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseUrlStateOptions {
  debounceMs?: number;
  resetPageOnChange?: boolean;
}

export function useUrlState<T extends Record<string, string | undefined>>(
  pathname: string,
  initialValues: T,
  options: UseUrlStateOptions = {}
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPageOnChange = false } = options;

  // Get current values from URL, using initialValues as fallback
  const values = Object.keys(initialValues).reduce((acc, key) => {
    const urlValue = searchParams.get(key);
    acc[key as keyof T] = (urlValue || initialValues[key]) as T[keyof T];
    return acc;
  }, {} as T);

  // Update URL state with new values
  const updateState = useCallback((updates: Partial<T>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '' || value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, value as string);
      }
    });

    // Reset page if specified
    if (resetPageOnChange) {
      params.set('page', '1');
    }

    // Navigate to new URL
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams, resetPageOnChange]);

  return { values, updateState };
}