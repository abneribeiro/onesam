import { useEffect, useState } from 'react';

/**
 * Hook para debounce de valores
 * Útil para search inputs e outros casos onde queremos aguardar o utilizador parar de digitar
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
