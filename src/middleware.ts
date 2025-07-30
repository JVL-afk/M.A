// CORRECTED MIDDLEWARE - AUTHENTICATION FIXED
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
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

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/my-websites',
  '/create-website',
  '/analytics',
  '/settings',
  '/api/user',
  '/api/websites',
  '/api/ai'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
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
    // Get authentication token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      // No token found, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Basic token validation (just check if it exists and has proper structure)
    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      // Token appears valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
