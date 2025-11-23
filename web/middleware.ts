import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const authRoutes = ['/login', '/register', '/forgot-password'];
const adminRoutes = ['/admin'];
const formandoOnlyRoutes = ['/dashboard', '/minhas-inscricoes'];

interface SessionUser {
  id: string;
  email: string;
  name: string;
  tipoPerfil: 'admin' | 'formando';
}

interface SessionResponse {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  } | null;
  user: SessionUser | null;
}

async function getSessionFromAPI(request: NextRequest): Promise<SessionResponse | null> {
  const sessionCookie = request.cookies.get('better-auth.session_token');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const baseURL = apiUrl.replace(/\/api\/?$/, '');

    const response = await fetch(`${baseURL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        'Cookie': `better-auth.session_token=${sessionCookie.value}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as SessionResponse;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

function getDefaultRedirectPath(tipoPerfil: string): string {
  switch (tipoPerfil) {
    case 'admin':
      return '/admin/dashboard';
    case 'formando':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('better-auth.session_token');
  const hasSessionCookie = !!sessionCookie?.value;

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = adminRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isFormandoOnlyRoute = formandoOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Se não tem cookie de sessão e não é rota pública, redireciona para login
  if (!hasSessionCookie && !isPublicRoute && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Root (/) is public - no redirect needed for unauthenticated users

  // Se tem cookie de sessão, verifica o tipo de perfil para redirecionamento
  if (hasSessionCookie) {
    const sessionData = await getSessionFromAPI(request);
    const user = sessionData?.user;
    const tipoPerfil = user?.tipoPerfil;

    // SECURITY: If we can't determine the profile, handle each case carefully
    if (!tipoPerfil) {
      // For auth routes, allow access (they can re-authenticate if needed)
      if (isAuthRoute) {
        return NextResponse.next();
      }
      // For admin routes, redirect to login - don't allow access without valid profile
      if (isAdminRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // For other protected routes, let client-side guards validate
      // This handles the case where session exists but tipoPerfil is loading
      return NextResponse.next();
    }

    // Usuário autenticado tentando acessar rotas de auth (login, register)
    if (isAuthRoute) {
      const redirectPath = getDefaultRedirectPath(tipoPerfil);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Rota raiz - redireciona baseado no perfil
    if (pathname === '/') {
      const redirectPath = getDefaultRedirectPath(tipoPerfil);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Proteção de rotas admin - apenas admins podem acessar
    if (isAdminRoute && tipoPerfil !== 'admin') {
      const redirectPath = getDefaultRedirectPath(tipoPerfil);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Proteção de rotas exclusivas de formando - admins são redirecionados
    if (isFormandoOnlyRoute && tipoPerfil === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
