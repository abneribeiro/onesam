import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

/**
 * Logo da plataforma OneSam
 * Pode ser usado com ou sem texto, em diferentes tamanhos
 */
export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: 'h-8 w-8 text-lg',
      text: 'text-lg',
    },
    md: {
      icon: 'h-10 w-10 text-xl',
      text: 'text-xl',
    },
    lg: {
      icon: 'h-12 w-12 text-2xl',
      text: 'text-2xl',
    },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-[var(--brand-500)] to-[var(--accent-500)]',
          'flex items-center justify-center text-white font-bold shadow-md',
          sizeClasses[size].icon
        )}
        aria-label="OneSam"
      >
        S
      </div>
      {showText && (
        <span className={cn('font-display font-bold', sizeClasses[size].text)}>
          OneSam
        </span>
      )}
    </div>
  );
}
