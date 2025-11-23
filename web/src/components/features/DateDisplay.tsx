import { Calendar } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface DateDisplayProps {
  date: string | Date;
  label?: string;
  icon?: boolean;
  className?: string;
}

/**
 * Componente para exibir datas formatadas de forma consistente
 * Opcionalmente com ícone de calendário e label
 */
export function DateDisplay({
  date,
  label,
  icon = true,
  className,
}: DateDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      {icon && <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
      <span>
        {label && <span className="font-medium">{label}: </span>}
        {formatDate(date)}
      </span>
    </div>
  );
}

interface DateRangeDisplayProps {
  startDate: string | Date;
  endDate: string | Date;
  separator?: string;
  icon?: boolean;
  className?: string;
}

/**
 * Componente para exibir intervalo de datas
 * Ex: "01/01/2024 - 31/01/2024"
 */
export function DateRangeDisplay({
  startDate,
  endDate,
  separator = '—',
  icon = true,
  className,
}: DateRangeDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      {icon && <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
      <span>
        {formatDate(startDate)} {separator} {formatDate(endDate)}
      </span>
    </div>
  );
}
