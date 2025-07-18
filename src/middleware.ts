// This file should be placed at src/middleware.ts

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

// Configuration for the middleware
export const config = {
  // Skip middleware for static files and api routes
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
  
  // Continue with normal middleware processing for non-static files
  return NextResponse.next();
}
