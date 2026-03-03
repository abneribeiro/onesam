'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to safely handle values that differ between server and client rendering.
 * Prevents hydration mismatches by using server value initially, then switching to client value after hydration.
 */
export function useHydrationSafe<T>(serverValue: T, clientValue: () => T): T {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return isHydrated ? clientValue() : serverValue;
}

/**
 * Hook to check if component has been hydrated on the client.
 * Useful for conditional rendering of client-only features.
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}