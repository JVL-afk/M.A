import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Auth middleware for API routes
export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    // If no token, return unauthorized
    if (!token) {
      return {
        success: false,
        error: 'Authentication required.',
        status: 401
      };
    }

    // Verify token
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-default-secret-key-for-development'
      ) as any;
      
      return {
        success: true,
        user: decoded,
        status: 200
      };
    } catch (error) {
      // If token is invalid or expired
      console.error('TOKEN_VERIFICATION_ERROR:', error);
      return {
        success: false,
        error: 'Invalid or expired authentication token.',
        status: 401
      };
    }
  } catch (error) {
    console.error('AUTH_MIDDLEWARE_ERROR:', error);
    return {
      success: false,
      error: 'Authentication error.',
      status: 500
    };
  }
}

// Function to get user info from token (for server components)
export async function getUserFromToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-secret-key-for-development'
    ) as any;
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    console.error('GET_USER_ERROR:', error);
    return null;
  }
}

// Function to check if user is authenticated (for client components)
export function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  return !!token;
}

// Function to handle unauthorized responses
export function unauthorizedResponse(message = 'Authentication required.') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}
