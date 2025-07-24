import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from '../mongodb';

// Types for authentication utilities
export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  };
  profile: {
    avatar?: string;
    bio?: string;
    website?: string;
    preferences: {
      emailNotifications: boolean;
      marketingEmails: boolean;
      theme: 'light' | 'dark' | 'auto';
    };
  };
  security: {
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastPasswordChange: Date;
    loginAttempts: number;
    lockUntil?: Date;
  };
  usage: {
    websitesCreated: number;
    aiRequestsThisMonth: number;
    lastActiveAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  token?: string;
  refreshToken?: string;
  error?: string;
}

// Enhanced JWT utilities with security features
export class JWTUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRES = '15m'; // Short-lived access tokens
  private static readonly REFRESH_TOKEN_EXPIRES = '7d'; // Longer refresh tokens
  
  // Generate access token
  static generateAccessToken(user: Partial<User>): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    const payload = {
      userId: user._id,
      email: user.email,
      plan: user.subscription?.plan || 'free',
      type: 'access'
    };
    
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
      issuer: 'affilify-auth',
      audience: 'affilify-api'
    });
  }
  
  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: 'refresh',
      jti: crypto.randomUUID() // Unique token ID for revocation
    };
    
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES,
      issuer: 'affilify-auth',
      audience: 'affilify-refresh'
    });
  }
  
  // Verify access token
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'affilify-auth',
        audience: 'affilify-api'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }
  
  // Verify refresh token
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.REFRESH_SECRET, {
        issuer: 'affilify-auth',
        audience: 'affilify-refresh'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  // Extract token from request headers or cookies
  static extractTokenFromRequest(request: NextRequest): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('access-token')?.value || null;
    
    // Check refresh token in cookies
    const refreshToken = request.cookies.get('refresh-token')?.value || null;
    
    return { accessToken, refreshToken };
  }
}

// Password utilities with enhanced security
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  
  // Hash password with salt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  // Generate secure random password
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
  
  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    } else {
      score += 1;
    }
    
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }
    
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }
    
    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }
    
    if (password.length >= 12) {
      score += 1;
    }
    
    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }
  
  // Generate password reset token
  static generateResetToken(): {
    token: string;
    hashedToken: string;
    expires: Date;
  } {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return { token, hashedToken, expires };
  }
}

// User management utilities
export class UserUtils {
  // Create new user with validation
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResult> {
    try {
      const { db } = await connectToDatabase();
      
      // Validate input
      if (!this.validateEmail(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }
      
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.feedback.join(', ') };
      }
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: userData.email });
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }
      
      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(userData.password);
      
      // Create user document
      const newUser: Omit<User, '_id'> = {
        email: userData.email.toLowerCase(),
        name: userData.name.trim(),
        password: hashedPassword,
        subscription: {
          plan: 'free',
          status: 'active'
        },
        profile: {
          preferences: {
            emailNotifications: true,
            marketingEmails: false,
            theme: 'auto'
          }
        },
        security: {
          emailVerified: false,
          emailVerificationToken: crypto.randomUUID(),
          lastPasswordChange: new Date(),
          loginAttempts: 0
        },
        usage: {
          websitesCreated: 0,
          aiRequestsThisMonth: 0,
          lastActiveAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      
      // Generate tokens
      const user = { ...newUser, _id: result.insertedId.toString() };
      const accessToken = JWTUtils.generateAccessToken(user);
      const refreshToken = JWTUtils.generateRefreshToken(user._id);
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        token: accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }
  
  // Authenticate user login
  static async authenticateUser(email: string, password: string): Promise<AuthResult> {
    try {
      const { db } = await connectToDatabase();
      
      // Find user
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Check if account is locked
      if (user.security.lockUntil && user.security.lockUntil > new Date()) {
        const lockTimeRemaining = Math.ceil((user.security.lockUntil.getTime() - Date.now()) / 60000);
        return { success: false, error: `Account locked. Try again in ${lockTimeRemaining} minutes` };
      }
      
      // Verify password
      const isValidPassword = await PasswordUtils.verifyPassword(password, user.password);
      if (!isValidPassword) {
        // Increment login attempts
        await this.incrementLoginAttempts(user._id);
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Reset login attempts on successful login
      await this.resetLoginAttempts(user._id);
      
      // Update last active
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            'usage.lastActiveAt': new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      // Generate tokens
      const accessToken = JWTUtils.generateAccessToken(user);
      const refreshToken = JWTUtils.generateRefreshToken(user._id.toString());
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        token: accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }
  
  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({ _id: userId });
      return user as User | null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
  
  // Update user subscription
  static async updateSubscription(userId: string, subscriptionData: Partial<User['subscription']>): Promise<boolean> {
    try {
      const { db } = await connectToDatabase();
      
      await db.collection('users').updateOne(
        { _id: userId },
        { 
          $set: { 
            subscription: subscriptionData,
            updatedAt: new Date()
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }
  
  // Increment login attempts
  private static async incrementLoginAttempts(userId: string): Promise<void> {
    const { db } = await connectToDatabase();
    const maxAttempts = 5;
    const lockTime = 15 * 60 * 1000; // 15 minutes
    
    const user = await db.collection('users').findOne({ _id: userId });
    const attempts = (user?.security?.loginAttempts || 0) + 1;
    
    const updateData: any = {
      'security.loginAttempts': attempts,
      updatedAt: new Date()
    };
    
    if (attempts >= maxAttempts) {
      updateData['security.lockUntil'] = new Date(Date.now() + lockTime);
    }
    
    await db.collection('users').updateOne({ _id: userId }, { $set: updateData });
  }
  
  // Reset login attempts
  private static async resetLoginAttempts(userId: string): Promise<void> {
    const { db } = await connectToDatabase();
    
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $unset: { 
          'security.loginAttempts': '',
          'security.lockUntil': ''
        },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Sanitize user data for client response
  static sanitizeUser(user: User): Partial<User> {
    const { password, security, ...sanitizedUser } = user;
    return {
      ...sanitizedUser,
      security: {
        emailVerified: security.emailVerified,
        lastPasswordChange: security.lastPasswordChange
      }
    };
  }
  
  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  // Generate email verification token
  static generateEmailVerificationToken(): string {
    return crypto.randomUUID();
  }
}

// Session management utilities
export class SessionUtils {
  // Create session
  static async createSession(userId: string, refreshToken: string): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      
      const session = {
        userId,
        refreshToken: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: '', // Can be populated from request
        ipAddress: '' // Can be populated from request
      };
      
      await db.collection('sessions').insertOne(session);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }
  
  // Validate session
  static async validateSession(refreshToken: string): Promise<boolean> {
    try {
      const { db } = await connectToDatabase();
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      const session = await db.collection('sessions').findOne({
        refreshToken: hashedToken,
        expiresAt: { $gt: new Date() }
      });
      
      return !!session;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
  
  // Revoke session
  static async revokeSession(refreshToken: string): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      await db.collection('sessions').deleteOne({ refreshToken: hashedToken });
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  }
  
  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      await db.collection('sessions').deleteMany({
        expiresAt: { $lt: new Date() }
      });
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }
}

// Export all utilities
export default {
  JWTUtils,
  PasswordUtils,
  UserUtils,
  SessionUtils
};
