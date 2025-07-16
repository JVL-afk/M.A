import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Integrated middleware combining authentication and custom domain routing
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // --- CUSTOM DOMAIN ROUTING (First Priority) ---
  // Handle custom domains before authentication checks
  
  // Skip custom domain logic for main domain, localhost, and Vercel domains
  const isMainDomain = hostname.includes('vercel.app') || 
                      hostname.includes('localhost') || 
                      hostname === process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '');

  // Skip custom domain logic for API routes and static files
  const isStaticOrApi = pathname.startsWith('/api/') ||
                       pathname.startsWith('/_next/') ||
                       pathname.startsWith('/favicon.ico');

  if (!isMainDomain && !isStaticOrApi) {
    try {
      // Check if this hostname is a custom domain
      const client = await connectToDatabase();
      const db = client.db('affilify');
      
      const customDomain = await db.collection('custom_domains').findOne({
        domain: hostname,
        status: 'active'
      });

      if (customDomain) {
        // Get the associated website
        const website = await db.collection('generated_websites').findOne({
          _id: customDomain.websiteId
        });

        if (website) {
          // Serve the website content directly (bypass all other middleware)
          const response = new NextResponse(website.content, {
            headers: {
              'Content-Type': 'text/html',
            },
          });

          // Add security headers
          response.headers.set('X-Frame-Options', 'DENY');
          response.headers.set('X-Content-Type-Options', 'nosniff');
          response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

          return response;
        }
      }
    } catch (error) {
      console.error('Custom domain middleware error:', error);
      // Continue with normal authentication flow if custom domain fails
    }
  }

  // --- AUTHENTICATION MIDDLEWARE (Second Priority) ---
  // Your existing authentication logic for the main application

  // 1. Define Public and Protected Routes
  const publicPaths = ['/login', '/signup', '/about', '/pricing', '/features', '/docs', '/'];
  const apiAuthPaths = ['/api/auth/login', '/api/auth/signup'];
  
  // Check if the current path is a public page or an auth API endpoint
  const isPublicPath = publicPaths.includes(pathname) || apiAuthPaths.includes(pathname);

  // 2. Get the Authentication Token
  const token = request.cookies.get('auth-token')?.value;

  // 3. Redirect Logic

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

  // 4. Allow Request to Proceed
  // If none of the above conditions are met, the request is valid.
  return NextResponse.next();
}

// Matcher Configuration
// This tells the middleware which paths to run on.
// We exclude static files and image optimization routes.
export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};

