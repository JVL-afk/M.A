import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './mongodb';
import { rateLimit } from './rate-limit';

// Types for authentication
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
  };
  createdAt: Date;
  lastLogin: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

// Enhanced JWT utilities with production security
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '30d';
  
  // Generate secure JWT token
  static generateToken(user: AuthUser): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      plan: user.subscription.plan
    };
    
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'affilify',
      audience: 'affilify-users'
    });
  }
  
  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );
  }
  
  // Verify JWT token with comprehensive validation
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'affilify',
        audience: 'affilify-users'
      }) as JWTPayload;
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }
  
  // Hash password with salt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // High security salt rounds
    return bcrypt.hash(password, saltRounds);
  }
  
  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  // Extract token from request
  static extractTokenFromRequest(request: NextRequest): string | null {
    // Check Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Check cookies as fallback
    const cookieToken = request.cookies.get('auth-token')?.value;
    return cookieToken || null;
  }
  
  // Get user from database
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({ _id: userId });
      
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        subscription: user.subscription || { plan: 'free', status: 'active' },
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

// Authentication middleware for API routes
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'auth', 100, 60); // 100 requests per minute
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    
    // Extract token
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return { success: false, error: 'No authentication token provided' };
    }
    
    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Get user from database
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Check if subscription is active for premium features
    if (user.subscription.status !== 'active' && user.subscription.plan !== 'free') {
      return { success: false, error: 'Subscription inactive' };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Middleware for protecting routes that require authentication
export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error || 'Authentication required' },
      { status: 401 }
    );
  }
  
  return authResult.user!;
}

// Middleware for protecting premium features
export async function requirePremium(request: NextRequest): Promise<NextResponse | AuthUser> {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error || 'Authentication required' },
      { status: 401 }
    );
  }
  
  const user = authResult.user!;
  if (user.subscription.plan === 'free') {
    return NextResponse.json(
      { error: 'Premium subscription required' },
      { status: 403 }
    );
  }
  
  return user;
}

// Secure cookie configuration
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

// Login attempt tracking for brute force protection
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export async function trackLoginAttempt(email: string): Promise<boolean> {
  const now = new Date();
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset attempts if last attempt was more than 15 minutes ago
  if (now.getTime() - attempts.lastAttempt.getTime() > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if too many attempts
  if (attempts.count >= 5) {
    return false; // Blocked
  }
  
  // Increment attempt count
  attempts.count++;
  attempts.lastAttempt = now;
  loginAttempts.set(email, attempts);
  
  return true;
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { valid: errors.length === 0, errors };
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

export default AuthService;
