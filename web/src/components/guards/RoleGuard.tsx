'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoPerfil } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: TipoPerfil[];
  redirectTo?: string;
}

/**
 * Enhanced RoleGuard with security hardening:
 * - Error boundaries for auth failures
 * - Timing attack protection
 * - Strict validation
 * - Secure redirect handling
 */
export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { currentUser, loading, initialCheckDone, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mountTime] = useState(() => Date.now());

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Security-hardened authentication check
  useEffect(() => {
    if (!initialCheckDone || loading) return;

    // Add minimum loading time to prevent timing attacks
    const minLoadTime = 100;
    const elapsed = Date.now() - mountTime;
    const remainingTime = Math.max(0, minLoadTime - elapsed);

    const performAuthCheck = () => {
      try {
        // Reset any previous auth errors
        setAuthError(null);

        // Strict validation: user must be authenticated
        if (!isAuthenticated) {
          console.warn('Security: Unauthenticated access attempt blocked');
          router.push('/login');
          return;
        }

        // Strict validation: user object must exist and be valid
        if (!currentUser || !currentUser.tipoPerfil) {
          console.warn('Security: Invalid user profile detected, clearing session');
          setAuthError('Perfil de usuário inválido. Por favor, faça login novamente.');
          // Clear session and redirect
          document.cookie = 'better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          router.push('/login');
          return;
        }

        // Role validation with security logging
        if (!allowedRoles.includes(currentUser.tipoPerfil)) {
          console.warn(`Security: Access denied for role ${currentUser.tipoPerfil} to roles ${allowedRoles.join(', ')}`);

          const defaultRedirect = currentUser.tipoPerfil === 'admin'
            ? '/admin/dashboard'
            : '/dashboard';

          // Validate redirect URL to prevent open redirect attacks
          const safeRedirectTo = redirectTo && /^\/[a-zA-Z0-9-_/]+$/.test(redirectTo)
            ? redirectTo
            : defaultRedirect;

          router.push(safeRedirectTo);
          return;
        }
      } catch (error) {
        console.error('Security: Authentication check failed:', error);
        setAuthError('Erro de autenticação. Por favor, recarregue a página.');
      }
    };

    // Apply minimum timing to prevent timing-based attacks
    redirectTimeoutRef.current = setTimeout(performAuthCheck, remainingTime);

  }, [currentUser, loading, initialCheckDone, isAuthenticated, allowedRoles, redirectTo, router]);

  // Show error state if auth check failed
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // Show loading state - consistent timing to prevent attacks
  if (!initialCheckDone || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Final security check before rendering - prevent any bypass
  if (!isAuthenticated || !currentUser || !allowedRoles.includes(currentUser.tipoPerfil)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // All security checks passed - render protected content
  return <>{children}</>;
}

/**
 * Guard específico para rotas de admin
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/dashboard">
      {children}
    </RoleGuard>
  );
}

/**
 * Guard específico para rotas de formando
 */
export function FormandoGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['formando']} redirectTo="/admin/dashboard">
      {children}
    </RoleGuard>
  );
}
