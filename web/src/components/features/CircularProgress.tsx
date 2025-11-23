'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
  labelClassName?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  className,
  trackClassName,
  progressClassName,
  labelClassName,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  // Determine color based on progress
  const getProgressColor = () => {
    if (normalizedValue >= 100) return 'text-success';
    if (normalizedValue >= 75) return 'text-success';
    if (normalizedValue >= 50) return 'text-primary';
    if (normalizedValue >= 25) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={cn('text-muted/30', trackClassName)}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500 ease-out',
            getProgressColor(),
            progressClassName
          )}
        />
      </svg>
      {showLabel && (
        <div className={cn('absolute flex flex-col items-center', labelClassName)}>
          <span className="text-2xl font-bold">{Math.round(normalizedValue)}%</span>
          {normalizedValue >= 100 && (
            <span className="text-xs text-success font-medium">Completo</span>
          )}
        </div>
      )}
    </div>
  );
}

// Smaller variant for inline use
export function CircularProgressSmall({
  value,
  size = 40,
  strokeWidth = 4,
  className,
}: Omit<CircularProgressProps, 'showLabel' | 'labelClassName'>) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-medium">{Math.round(normalizedValue)}%</span>
    </div>
  );
}
