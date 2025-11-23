'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

/**
 * Imagem otimizada com next/image, lazy loading e fallback automático
 * Mostra placeholder enquanto carrega e fallback se houver erro
 */
export function LazyImage({
  src,
  alt,
  fallback = '/placeholder.png',
  className,
  fill = false,
  width,
  height,
  sizes = '100vw',
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imageSrc = hasError ? fallback : src;

  // Se não tiver src válido, mostrar fallback diretamente
  if (!src) {
    return (
      <div className={cn('relative overflow-hidden bg-muted', className)}>
        <Image
          src={fallback}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Skeleton/placeholder enquanto carrega */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
}
