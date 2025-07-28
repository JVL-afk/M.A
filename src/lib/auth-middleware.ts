// FIXED MIDDLEWARE WITH AUTHENTICATION RESTORED
// Replace your existing src/middleware.ts with this corrected version

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of static file extensions that should bypass middleware
const STATIC_FILE_EXTENSIONS = [
  '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.css', '.js', '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz'
];

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
  '/checkout'
];

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard'
];

// Configuration for the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Simple JWT verification for Edge Runtime compatibility
function verifyJWTToken(token: string): boolean {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode payload (basic validation)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    // Token appears valid
    return true;
  } catch (error) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a static file by extension
  const isStaticFile = STATIC_FILE_EXTENSIONS.some(ext => 
    pathname.toLowerCase().endsWith(ext)
  );

  // Skip middleware for static files
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Check if route is public (no authentication required)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow access to public routes
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

    // Verify the token
    const isValidToken = verifyJWTToken(authToken);
    
    if (!isValidToken) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // For all other routes, continue normally
  return NextResponse.next();
}
