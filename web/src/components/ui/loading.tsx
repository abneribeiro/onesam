import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Loading Spinner - Basic animated spinner
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
    />
  );
}

/**
 * Loading State - Centered loading with message
 */
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'A carregar...',
  size = 'md',
  fullScreen = false,
  className
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={size} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline Loading - For buttons and inline elements
 */
interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ text = 'Carregando...', size = 'sm', className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

/**
 * Loading Overlay - For overlaying content during loading
 */
interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
  className?: string;
}

export function LoadingOverlay({
  message = 'A carregar...',
  transparent = false,
  className
}: LoadingOverlayProps) {
  const backgroundClass = transparent
    ? 'bg-white/50 backdrop-blur-sm'
    : 'bg-white/80 backdrop-blur-sm';

  return (
    <div className={cn(
      'absolute inset-0 z-50 flex items-center justify-center',
      backgroundClass,
      className
    )}>
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg border">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}

/**
 * Page Loading - For full page loading states
 */
interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageLoading({
  title = 'OneSam',
  subtitle = 'A carregar página...',
  className
}: PageLoadingProps) {
  return (
    <div className={cn('flex items-center justify-center min-h-screen bg-background', className)}>
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-bold text-brand-600">{title}</div>
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}