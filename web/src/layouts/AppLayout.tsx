'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from '../components/AppSidebar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { SkipToContent } from '../components/features';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading, currentUser, initialCheckDone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && initialCheckDone) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, initialCheckDone, router]);

  // SECURITY: Show loading while profile is not ready
  // This prevents showing wrong navigation items before profile is confirmed
  if (loading || !initialCheckDone || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SkipToContent />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" role="banner">
          <SidebarTrigger className="-ml-1" aria-label="Alternar menu lateral" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumbs />
        </header>

        <main
          id="main-content"
          className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"
          role="main"
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
