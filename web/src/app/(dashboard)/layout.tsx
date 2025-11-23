'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O dashboard layout permite acesso a formandos e admins para algumas rotas
  // A proteção específica é feita no middleware e em páginas individuais
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </AppLayout>
  );
}
