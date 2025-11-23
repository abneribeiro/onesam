'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, initialCheckDone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialCheckDone && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, initialCheckDone, router]);

  if (loading || !initialCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
