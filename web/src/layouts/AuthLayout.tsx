'use client';

import Link from 'next/link';
import { Logo } from '@/components/features';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-auth">
      <div className="container relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 w-full text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Logo size="md" />
          </Link>
        </div>

        <div className="w-full max-w-[95%] sm:max-w-md md:max-w-lg">
          {children}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            &copy; {new Date().getFullYear()} OneSam. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
