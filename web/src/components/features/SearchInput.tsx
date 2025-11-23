'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * Input de pesquisa com debounce e botão para limpar
 * Ícone de lupa à esquerda, botão X à direita quando há texto
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Pesquisar...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [input, setInput] = useState(value);
  const debouncedValue = useDebounce(input, debounceMs);
  const prevDebouncedRef = useRef(debouncedValue);
  const onChangeRef = useRef(onChange);

  // Manter referência atualizada do onChange sem causar re-render
  onChangeRef.current = onChange;

  // Chamar onChange apenas quando debouncedValue realmente mudar
  useEffect(() => {
    if (debouncedValue !== prevDebouncedRef.current) {
      prevDebouncedRef.current = debouncedValue;
      onChangeRef.current(debouncedValue);
    }
  }, [debouncedValue]);

  // Sync external value changes (quando value muda externamente)
  useEffect(() => {
    if (value !== input && value !== debouncedValue) {
      setInput(value);
    }
  }, [value]);

  const handleClear = useCallback(() => {
    setInput('');
    onChangeRef.current('');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={input}
        onChange={handleInputChange}
        className="pl-10 pr-10"
        aria-label={placeholder}
      />
      {input && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
          aria-label="Limpar pesquisa"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
