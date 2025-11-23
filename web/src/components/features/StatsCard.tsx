import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // Positivo = aumento, negativo = redução
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  className?: string;
}

/**
 * Card de estatísticas com ícone, valor e trend opcional
 * Usado em dashboards para exibir métricas
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
  className,
}: StatsCardProps) {
  const variantClasses = {
    default: 'from-[var(--brand-500)]/10',
    success: 'from-[var(--success-500)]/10',
    warning: 'from-[var(--warning-500)]/10',
    error: 'from-[var(--error-500)]/10',
    info: 'from-[var(--info-500)]/10',
  };

  const iconColorClasses = {
    default: 'text-[var(--brand-600)]',
    success: 'text-[var(--success-600)]',
    warning: 'text-[var(--warning-600)]',
    error: 'text-[var(--error-600)]',
    info: 'text-[var(--info-600)]',
  };

  const iconBgClasses = {
    default: 'bg-[var(--brand-500)]/10',
    success: 'bg-[var(--success-500)]/10',
    warning: 'bg-[var(--warning-500)]/10',
    error: 'bg-[var(--error-500)]/10',
    info: 'bg-[var(--info-500)]/10',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-shadow',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Background gradient decorativo */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent',
          variantClasses[variant]
        )}
        aria-hidden="true"
      />

      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h3 className="text-3xl font-bold mt-2 tracking-tight">{value}</h3>

            {/* Indicador de tendência */}
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-2 text-sm font-medium',
                  trend > 0 ? 'text-[var(--success-600)]' : 'text-[var(--error-600)]'
                )}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {Math.abs(trend)}%
                  <span className="sr-only">
                    {trend > 0 ? ' de aumento' : ' de redução'}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Ícone grande */}
          <div
            className={cn(
              'h-16 w-16 rounded-full flex items-center justify-center',
              iconBgClasses[variant]
            )}
          >
            <Icon className={cn('h-8 w-8', iconColorClasses[variant])} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
