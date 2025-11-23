'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { AdminGuard } from '@/components/guards/RoleGuard';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <AdminGuard>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </AdminGuard>
    </AppLayout>
  );
}
