import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '-';
    return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
};

/**
 * Formata data e hora para exibição (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '-';
    return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '-';
  }
};

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 */
export const formatDateForInput = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '';
    return format(parsedDate, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

/**
 * Formata data de forma relativa (ex: "há 2 dias")
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '-';

    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
    return `Há ${Math.floor(diffDays / 365)} anos`;
  } catch {
    return '-';
  }
};

/**
 * Verifica se uma data já passou
 */
export const isPastDate = (date: string | Date): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return false;
    return parsedDate < new Date();
  } catch {
    return false;
  }
};

/**
 * Verifica se uma data está no futuro
 */
export const isFutureDate = (date: string | Date): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return false;
    return parsedDate > new Date();
  } catch {
    return false;
  }
};
