import { LoadingState as UnifiedLoadingState } from '@/components/ui/loading-system';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * @deprecated Use LoadingState from @/components/ui/loading-system instead
 * This component is kept for backwards compatibility
 */
export function LoadingState({ message = 'A carregar...', fullScreen = false }: LoadingStateProps) {
  return (
    <UnifiedLoadingState
      message={message}
      fullScreen={fullScreen}
      size="md"
    />
  );
}
