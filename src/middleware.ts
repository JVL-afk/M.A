// Authentication Middleware
// File: src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/api/dashboard',
  '/api/generate-website',
  '/api/analyze-website',
  '/api/user',
  '/api/analytics'
];

// Define admin routes (if needed)
const adminRoutes = [
  '/admin'
];

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  '/login',
  '/signup'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is public (login/signup)
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login for web pages, return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      } else {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Add user info to headers for API routes
      if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decoded.userId);
        requestHeaders.set('x-user-email', decoded.email);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

    } catch (error) {
      // Invalid token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      } else {
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set('auth-token', '', { maxAge: 0 });
        return response;
      }
    }
  }

  // Handle public routes (redirect to dashboard if already authenticated)
  if (isPublicRoute && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Invalid token, clear it and continue
      const response = NextResponse.next();
      response.cookies.set('auth-token', '', { maxAge: 0 });
      return response;
    }
  }

  // Handle admin routes (additional admin check would go here)
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // TODO: Add admin role check here
      // For now, all authenticated users can access admin (change this in production)
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
