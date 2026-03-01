'use client';

import React, { Component, ReactNode } from 'react';
import { isAuthenticationError, isPermissionError, getErrorTypeMessage } from '../lib/errorHandler';
import { Button } from './ui/button';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onAuthError?: () => void;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isAuthError: boolean;
  isPermissionError: boolean;
}

/**
 * Error boundary specifically designed to handle authentication and permission errors
 * Provides user-friendly fallback UI for auth-related failures
 */
class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isPermissionError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    const isAuth = isAuthenticationError(error);
    const isPerm = isPermissionError(error);

    return {
      hasError: true,
      error,
      isAuthError: isAuth,
      isPermissionError: isPerm,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onAuthError callback if it's an auth error
    if (this.state.isAuthError && this.props.onAuthError) {
      this.props.onAuthError();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isPermissionError: false,
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  handleLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      const { error, isAuthError, isPermissionError } = this.state;

      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Authentication error fallback
      if (isAuthError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sessão Expirada
              </h2>
              <p className="text-gray-600">
                A sua sessão expirou. Por favor, faça login novamente para continuar.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={this.handleLogin} className="px-6">
                Fazer Login
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="px-6"
              >
                Ir para Início
              </Button>
            </div>
          </div>
        );
      }

      // Permission error fallback
      if (isPermissionError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Negado
              </h2>
              <p className="text-gray-600">
                Não tem permissões para aceder a esta funcionalidade.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="px-6"
              >
                Voltar ao Início
              </Button>
              <Button
                variant="ghost"
                onClick={this.handleRetry}
                className="px-6"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        );
      }

      // Generic error fallback
      const errorMessage = error ? getErrorTypeMessage(error) : 'Ocorreu um erro inesperado';

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Algo correu mal
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage}
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left text-sm text-gray-500 bg-gray-50 p-4 rounded mt-4">
                <summary className="cursor-pointer">Detalhes técnicos</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={this.handleRetry} className="px-6">
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="px-6"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;