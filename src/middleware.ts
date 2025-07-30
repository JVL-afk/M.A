import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/features',
  '/terms',
  '/privacy',
  '/docs',
  '/about-me',
  '/checkout'
];

const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/user',
  '/api/websites',
  '/api/ai'
];

// ROUTE REDIRECTS - Fix the navigation issue!
const ROUTE_REDIRECTS = {
  '/my-websites': '/dashboard/my-websites',
  '/create-website': '/dashboard/create-website'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||  // 🔥 CRITICAL FIX: Exclude auth API routes!
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle route redirects FIRST
  if (ROUTE_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(ROUTE_REDIRECTS[pathname], request.url));
  }

  // Allow access to public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }

      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      return NextResponse.next();
    } catch (error) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
