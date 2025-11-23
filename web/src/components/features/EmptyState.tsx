'use client';

import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center animate-fade-in',
        isCompact ? 'py-8' : 'py-16',
        variant === 'card' && 'bg-card rounded-xl border p-8',
        className
      )}
    >
      {/* Animated icon container */}
      <div className="relative mb-6">
        {/* Background glow effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-2xl opacity-50',
            'bg-gradient-to-br from-primary/20 to-accent/20',
            'animate-pulse'
          )}
          aria-hidden="true"
        />
        {/* Icon container */}
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-muted to-muted/50',
            'border border-border/50',
            'transition-transform duration-300 hover:scale-105',
            isCompact ? 'p-4' : 'p-6'
          )}
        >
          <Icon
            className={cn(
              'text-muted-foreground',
              isCompact ? 'h-8 w-8' : 'h-12 w-12'
            )}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold mb-2',
          isCompact ? 'text-base' : 'text-xl'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-muted-foreground max-w-md',
          isCompact ? 'text-sm mb-4' : 'text-base mb-6'
        )}
      >
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              size={isCompact ? 'default' : 'lg'}
              className="gap-2 group"
            >
              {actionLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size={isCompact ? 'default' : 'lg'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Simpler inline empty state for lists
export function EmptyStateInline({
  icon: Icon,
  message,
  className,
}: {
  icon: LucideIcon;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-8 text-muted-foreground',
        className
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
