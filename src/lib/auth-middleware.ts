import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'affilify_jwt_2025_romania_student_success_portocaliu_orange_power_gaming_affiliate_marketing_revolution_secure_token_generation_system';

export async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists in database
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      plan: user.plan || 'basic',
      isVerified: user.isVerified || false,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Invalid or expired authentication token');
  }
}

export async function requirePremium(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  if (user.plan === 'basic') {
    throw new Error('Premium plan required for this feature');
  }
  
  return user;
}

export async function requireEnterprise(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  if (user.plan !== 'enterprise') {
    throw new Error('Enterprise plan required for this feature');
  }
  
  return user;
}

export async function generateAuthToken(userId: string, email: string) {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

export async function verifyApiKey(apiKey: string) {
  try {
    const { db } = await connectToDatabase();
    const keyRecord = await db.collection('api_keys').findOne({ 
      key: apiKey,
      isActive: true 
    });
    
    if (!keyRecord) {
      throw new Error('Invalid API key');
    }
    
    // Check if key has expired
    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      throw new Error('API key has expired');
    }
    
    // Update last used timestamp
    await db.collection('api_keys').updateOne(
      { _id: keyRecord._id },
      { $set: { lastUsed: new Date() } }
    );
    
    return {
      userId: keyRecord.userId,
      permissions: keyRecord.permissions || [],
      rateLimit: keyRecord.rateLimit || 1000
    };
  } catch (error) {
    console.error('API key verification error:', error);
    throw error;
  }
}

export async function rateLimitCheck(identifier: string, limit: number = 100, windowMs: number = 60000) {
  try {
    const { db } = await connectToDatabase();
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    
    // Clean up old entries
    await db.collection('rate_limits').deleteMany({
      timestamp: { $lt: windowStart }
    });
    
    // Count requests in current window
    const requestCount = await db.collection('rate_limits').countDocuments({
      identifier,
      timestamp: { $gte: windowStart }
    });
    
    if (requestCount >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    // Record this request
    await db.collection('rate_limits').insertOne({
      identifier,
      timestamp: now
    });
    
    return {
      allowed: true,
      remaining: limit - requestCount - 1,
      resetTime: new Date(now.getTime() + windowMs)
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    throw error;
  }
}

