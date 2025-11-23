'use client';

import { lazy, Suspense, Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoPlayerInternal = lazy(() =>
  import('./VideoPlayer.internal').then((module) => ({
    default: module.VideoPlayer,
  }))
);

interface VideoPlayerProps {
  url: string;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
  onError?: () => void;
  autoSaveProgress?: boolean;
  initialTime?: number;
}

function VideoPlayerSkeleton() {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-sm">A carregar reprodutor de vídeo...</p>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class VideoPlayerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VideoPlayer Error:', error, errorInfo);
    this.props.onError?.();
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center p-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-white font-medium">Erro ao carregar o reprodutor</p>
                <p className="text-white/70 text-sm">
                  {this.state.error?.message || 'Ocorreu um erro inesperado'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function VideoPlayer(props: VideoPlayerProps) {
  return (
    <VideoPlayerErrorBoundary onError={props.onError}>
      <Suspense fallback={<VideoPlayerSkeleton />}>
        <VideoPlayerInternal {...props} />
      </Suspense>
    </VideoPlayerErrorBoundary>
  );
}
