import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    this.handleReset();
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Ocorreu um Erro</CardTitle>
              <CardDescription>
                Pedimos desculpa, algo correu mal. Por favor, tente novamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && error && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-mono text-destructive break-all">
                    {error.toString()}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleGoHome} className="gap-2">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Se o problema persistir, por favor contacte o suporte.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}
