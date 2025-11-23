'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useNotificacoes, useNotificacoesNaoLidasCount } from '../hooks/useNotificacoes';
import type { Notificacao } from '../types';

interface NotificationContextType {
  notifications: Notificacao[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function NotificationProvider({ children, isAuthenticated }: NotificationProviderProps) {
  const {
    notificacoes,
    isLoading: isLoadingNotifications,
    refetch,
    marcarComoLida,
    marcarTodasComoLidas,
    deletar,
  } = useNotificacoes();

  const { count: unreadCount, isLoading: isLoadingCount } = useNotificacoesNaoLidasCount();

  const value: NotificationContextType = useMemo(
    () => ({
      notifications: isAuthenticated ? notificacoes : [],
      unreadCount: isAuthenticated ? unreadCount : 0,
      isLoading: isLoadingNotifications || isLoadingCount,
      markAsRead: marcarComoLida,
      markAllAsRead: marcarTodasComoLidas,
      deleteNotification: deletar,
      refetch,
    }),
    [isAuthenticated, notificacoes, unreadCount, isLoadingNotifications, isLoadingCount, marcarComoLida, marcarTodasComoLidas, deletar, refetch]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
