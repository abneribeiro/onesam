'use client';

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { authClient, useSession } from '../lib/auth-client';
import type { Utilizador, AuthContextType, RegisterInput } from '../types';
import { SUCCESS_MESSAGES } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserFromSession(user: any): Utilizador | null {
  // CRITICAL: Do not use fallback for tipoPerfil - it causes security issues
  // where admin users briefly see formando UI before their real profile loads
  if (!user.tipoPerfil) {
    return null;
  }

  return {
    id: parseInt(user.id as string, 10),
    nome: user.name || '',
    email: user.email || '',
    emailVerified: user.emailVerified || false,
    avatar: user.image || undefined,
    ativo: user.ativo ?? true,
    tipoPerfil: user.tipoPerfil,
    perfilId: user.perfilId,
    dataCriacao: user.createdAt || new Date(),
    dataAtualizacao: user.updatedAt || new Date(),
  } as Utilizador;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const session = useSession();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Only consider user authenticated if we have both session data AND tipoPerfil
  // This prevents the flash of wrong profile content
  const currentUser: Utilizador | null = session.data?.user
    ? mapUserFromSession(session.data.user)
    : null;

  // User is only authenticated when we have a valid user with tipoPerfil
  const isAuthenticated = !!currentUser;
  const loading = session.isPending;

  useEffect(() => {
    // Only set initialCheckDone when session loading is complete
    // This prevents premature rendering before auth state is known
    if (!session.isPending && !initialCheckDone) {
      setInitialCheckDone(true);
    }
  }, [session.isPending, initialCheckDone]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Erro ao fazer login');
    }

    toast.success(SUCCESS_MESSAGES.LOGIN);

    // Poll for session to update with tipoPerfil from the server
    // After refetch, we need to fetch session directly from API to get fresh data
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      await session.refetch();
      // Fetch session directly from API to avoid stale React state
      const sessionResponse = await authClient.getSession();
      const currentData = sessionResponse.data?.user as Record<string, unknown> | undefined;
      if (currentData?.tipoPerfil) {
        return mapUserFromSession(currentData) as Utilizador;
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    throw new Error('Erro ao carregar perfil do usuário');
  }, [session]);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
      toast.success(SUCCESS_MESSAGES.LOGOUT);
    } catch (error: unknown) {
      toast.error('Erro ao fazer logout');
    }
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.palavrapasse,
      name: data.nome,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Erro ao registrar');
    }

    toast.success(SUCCESS_MESSAGES.REGISTER);

    // Poll for session to update with tipoPerfil from the server
    // After refetch, we need to fetch session directly from API to get fresh data
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      await session.refetch();
      // Fetch session directly from API to avoid stale React state
      const sessionResponse = await authClient.getSession();
      const currentData = sessionResponse.data?.user as Record<string, unknown> | undefined;
      if (currentData?.tipoPerfil) {
        return mapUserFromSession(currentData) as Utilizador;
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    throw new Error('Erro ao carregar perfil do usuário');
  }, [session]);

  const refreshUserData = useCallback(async () => {
    await session.refetch();
  }, [session]);

  const value: AuthContextType = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      loading,
      initialCheckDone,
      login,
      logout,
      register,
      refreshUserData,
    }),
    [currentUser, isAuthenticated, loading, initialCheckDone, login, logout, register, refreshUserData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
