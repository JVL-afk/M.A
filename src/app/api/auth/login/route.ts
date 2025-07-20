import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, ErrorFactory, ValidationHelper } from '../../../../lib/error-handler';
import { rateLimit } from '../../../../lib/rate-limit';
import { UserUtils, JWTUtils, SessionUtils } from '../../../../lib/auth/utils';
import { COOKIE_OPTIONS } from '../../../../lib/auth-middleware';

// Login handler
async function handleLogin(request: NextRequest): Promise<NextResponse> {
  // Rate limiting for authentication
  const rateLimitResult = await rateLimit(request, 'auth');
  if (!rateLimitResult.success) {
    throw ErrorFactory.rateLimit('Too many login attempts. Please try again later.');
  }
  
  const body = await request.json();
  
  // Validate request body
  ValidationHelper.validateRequired(body.email, 'email');
  ValidationHelper.validateRequired(body.password, 'password');
  ValidationHelper.validateEmail(body.email);
  
  const { email, password } = body;
  
  try {
    // Authenticate user
    const authResult = await UserUtils.authenticateUser(email, password);
    
    if (!authResult.success) {
      throw ErrorFactory.authentication(authResult.error || 'Authentication failed');
    }
    
    const user = authResult.user!;
    const accessToken = authResult.token!;
    const refreshToken = authResult.refreshToken!;
    
    // Create session
    await SessionUtils.createSession(user._id!, refreshToken);
    
    // Create response with secure cookies
    const response = NextResponse.json({
      success: true,
      data: {
        user: UserUtils.sanitizeUser(user),
        accessToken
      },
      message: 'Login successful'
    });
    
    // Set secure HTTP-only cookies
    response.cookies.set('access-token', accessToken, COOKIE_OPTIONS);
    response.cookies.set('refresh-token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
    });
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
    
  } catch (error) {
    // Log failed login attempt
    console.error('Login failed for email:', email, error);
    throw error;
  }
}

// Logout handler
async function handleLogout(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract refresh token from cookies
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (refreshToken) {
      // Revoke session
      await SessionUtils.revokeSession(refreshToken);
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
    
    // Clear cookies
    response.cookies.delete('access-token');
    response.cookies.delete('refresh-token');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout completed'
    });
    
    response.cookies.delete('access-token');
    response.cookies.delete('refresh-token');
    
    return response;
  }
}

// Refresh token handler
async function handleRefreshToken(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refresh-token')?.value;
  
  if (!refreshToken) {
    throw ErrorFactory.authentication('Refresh token required');
  }
  
  try {
    // Verify refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);
    
    // Validate session
    const isValidSession = await SessionUtils.validateSession(refreshToken);
    if (!isValidSession) {
      throw ErrorFactory.authentication('Invalid session');
    }
    
    // Get user
    const user = await UserUtils.getUserById(decoded.userId);
    if (!user) {
      throw ErrorFactory.authentication('User not found');
    }
    
    // Generate new access token
    const newAccessToken = JWTUtils.generateAccessToken(user);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: UserUtils.sanitizeUser(user)
      }
    });
    
    // Update access token cookie
    response.cookies.set('access-token', newAccessToken, COOKIE_OPTIONS);
    
    return response;
    
  } catch (error) {
    // Clear invalid tokens
    const response = NextResponse.json({
      success: false,
      error: 'Token refresh failed'
    }, { status: 401 });
    
    response.cookies.delete('access-token');
    response.cookies.delete('refresh-token');
    
    return response;
  }
}

// Main route handler
async function handleAuthRequest(request: NextRequest): Promise<NextResponse> {
  const method = request.method;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (method) {
    case 'POST':
      if (action === 'logout') {
        return handleLogout(request);
      } else if (action === 'refresh') {
        return handleRefreshToken(request);
      } else {
        return handleLogin(request);
      }
      
    default:
      throw ErrorFactory.validation(`Method ${method} not allowed`);
  }
}

// Export handlers with error handling
export const POST = withErrorHandler(handleAuthRequest);


