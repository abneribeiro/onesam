'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoPerfil } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: TipoPerfil[];
  redirectTo?: string;
}

/**
 * Componente de proteção de rotas baseado em roles.
 * Verifica se o usuário tem o perfil necessário para acessar a rota.
 * Usado como segunda camada de proteção além do middleware.
 */
export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { currentUser, loading, initialCheckDone, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialCheckDone || loading) return;

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Se está autenticado mas não tem o perfil permitido
    if (currentUser && !allowedRoles.includes(currentUser.tipoPerfil)) {
      const defaultRedirect = currentUser.tipoPerfil === 'admin'
        ? '/admin/dashboard'
        : '/dashboard';
      router.push(redirectTo || defaultRedirect);
    }
  }, [currentUser, loading, initialCheckDone, isAuthenticated, allowedRoles, redirectTo, router]);

  // Mostra loading enquanto verifica
  if (!initialCheckDone || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Se não está autenticado ou não tem permissão, não renderiza
  if (!isAuthenticated || !currentUser || !allowedRoles.includes(currentUser.tipoPerfil)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
