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

  // Validate environment variable exists - no fallback for security
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('Security: NEXT_PUBLIC_API_URL not configured');
    return null;
  }

  // Validate cookie value format for basic security
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionCookie.value)) {
    console.warn('Security: Invalid session cookie format detected');
    return null;
  }

  try {
    const baseURL = apiUrl.replace(/\/api\/?$/, '');

    // Add timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${baseURL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        'Cookie': `better-auth.session_token=${sessionCookie.value}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Session validation failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.warn('Security: Invalid session response format');
      return null;
    }

    return data as SessionResponse;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Security: Session validation timeout');
      } else {
        console.error('Security: Session validation error:', error.message);
      }
    }
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

    // If session validation failed completely (network, timeout, invalid response)
    if (sessionData === null) {
      console.warn('Security: Session validation failed, redirecting to login');
      // Clear the invalid session cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('better-auth.session_token');
      return response;
    }

    const user = sessionData?.user;
    const tipoPerfil = user?.tipoPerfil;

    // SECURITY: If session exists but no user profile, this indicates session corruption
    if (!tipoPerfil || !user) {
      console.warn('Security: Valid session but missing user profile, clearing session');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('better-auth.session_token');
      return response;
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
