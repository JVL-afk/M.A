import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function is the middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Define Public and Protected Routes ---
  const publicPaths = ['/login', '/signup', '/about', '/pricing', '/features', '/docs', '/'];
  const apiAuthPaths = ['/api/auth/login', '/api/auth/signup'];
  
  // Check if the current path is a public page or an auth API endpoint
  const isPublicPath = publicPaths.includes(pathname) || apiAuthPaths.includes(pathname);

  // --- 2. Get the Authentication Token ---
  const token = request.cookies.get('auth-token')?.value;

  // --- 3. Redirect Logic ---

  // If the user has a token and is trying to access a public page (like /login),
  // redirect them to the dashboard. They are already logged in.
  if (token && publicPaths.includes(pathname)) {
    // Exception: Allow access to the root path ('/') even if logged in.
    if (pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user does NOT have a token and is trying to access a protected page,
  // redirect them to the login page.
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- 4. Allow Request to Proceed ---
  // If none of the above conditions are met, the request is valid.
  return NextResponse.next();
}

// --- 5. Matcher Configuration ---
// This tells the middleware which paths to run on.
// We exclude static files and image optimization routes.
export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};
