import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

// Rate limit store interface
interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void>;
  increment(key: string): Promise<{ count: number; resetTime: number }>;
}

// In-memory store for development (use Redis in production)
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key);
    if (!data) return null;
    
    // Check if expired
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return data;
  }
  
  async set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void> {
    this.store.set(key, value);
    
    // Auto cleanup expired entries
    setTimeout(() => {
      const current = this.store.get(key);
      if (current && Date.now() > current.resetTime) {
        this.store.delete(key);
      }
    }, ttl);
  }
  
  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key);
    
    if (existing) {
      existing.count++;
      this.store.set(key, existing);
      return existing;
    } else {
      const newData = {
        count: 1,
        resetTime: Date.now() + 60000 // Default 1 minute window
      };
      this.store.set(key, newData);
      return newData;
    }
  }
}

// Redis store for production
class RedisStore implements RateLimitStore {
  private redis: any;
  
  constructor() {
    // Initialize Redis connection if available
    if (process.env.REDIS_URL) {
      try {
        const { Redis } = require('@upstash/redis');
        this.redis = Redis.fromEnv();
      } catch (error) {
        console.warn('Redis not available, falling back to memory store');
        this.redis = null;
      }
    }
  }
  
  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
  
  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    if (!this.redis) {
      // Fallback to memory store
      const memoryStore = new MemoryStore();
      return memoryStore.increment(key);
    }
    
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, 60); // Default 1 minute expiry
      
      const results = await pipeline.exec();
      const count = results[0][1];
      
      return {
        count,
        resetTime: Date.now() + 60000
      };
    } catch (error) {
      console.error('Redis increment error:', error);
      throw error;
    }
  }
}

// Rate limiter class
export class RateLimiter {
  private store: RateLimitStore;
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 60000, // Default 1 minute
      maxRequests: config.maxRequests || 100, // Default 100 requests
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      message: config.message || 'Too many requests, please try again later.',
    };
    
    // Use Redis in production, memory store in development
    this.store = process.env.REDIS_URL ? new RedisStore() : new MemoryStore();
  }
  
  private defaultKeyGenerator(request: NextRequest): string {
    // Use IP address as default key
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return `rate_limit:${ip}`;
  }
  
  async checkLimit(request: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator!(request);
    
    try {
      const current = await this.store.get(key);
      const now = Date.now();
      
      if (!current || now > current.resetTime) {
        // First request or window expired
        const resetTime = now + this.config.windowMs;
        await this.store.set(key, { count: 1, resetTime }, this.config.windowMs);
        
        return {
          allowed: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          resetTime
        };
      }
      
      if (current.count >= this.config.maxRequests) {
        // Rate limit exceeded
        return {
          allowed: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: current.resetTime,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        };
      }
      
      // Increment counter
      const updated = await this.store.increment(key);
      
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - updated.count),
        resetTime: updated.resetTime
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request on error to avoid blocking legitimate traffic
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs
      };
    }
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // Authentication endpoints - stricter limits
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `auth_limit:${ip}`;
    }
  }),
  
  // API endpoints - moderate limits
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `api_limit:${ip}`;
    }
  }),
  
  // AI content generation - resource-intensive limits
  aiGeneration: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 AI requests per minute
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `ai_limit:${ip}`;
    }
  }),
  
  // Payment endpoints - very strict limits
  payment: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 payment attempts per minute
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `payment_limit:${ip}`;
    }
  }),
  
  // Password reset - strict limits
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset attempts per hour
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `password_reset_limit:${ip}`;
    }
  }),
  
  // General endpoints - lenient limits
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
      return `general_limit:${ip}`;
    }
  })
};

// User-based rate limiting (for authenticated requests)
export class UserRateLimiter {
  private store: RateLimitStore;
  
  constructor() {
    this.store = process.env.REDIS_URL ? new RedisStore() : new MemoryStore();
  }
  
  async checkUserLimit(
    userId: string,
    action: string,
    limits: { windowMs: number; maxRequests: number }
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `user_limit:${userId}:${action}`;
    const now = Date.now();
    
    try {
      const current = await this.store.get(key);
      
      if (!current || now > current.resetTime) {
        const resetTime = now + limits.windowMs;
        await this.store.set(key, { count: 1, resetTime }, limits.windowMs);
        
        return {
          allowed: true,
          remaining: limits.maxRequests - 1,
          resetTime
        };
      }
      
      if (current.count >= limits.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: current.resetTime
        };
      }
      
      const updated = await this.store.increment(key);
      
      return {
        allowed: true,
        remaining: Math.max(0, limits.maxRequests - updated.count),
        resetTime: updated.resetTime
      };
    } catch (error) {
      console.error('User rate limit check error:', error);
      return {
        allowed: true,
        remaining: limits.maxRequests,
        resetTime: now + limits.windowMs
      };
    }
  }
}

// Subscription-based rate limiting
export const subscriptionLimits = {
  free: {
    aiRequests: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 }, // 10 per day
    websites: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3 }, // 3 per day
    apiCalls: { windowMs: 60 * 60 * 1000, maxRequests: 100 } // 100 per hour
  },
  pro: {
    aiRequests: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 100 }, // 100 per day
    websites: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 }, // 20 per day
    apiCalls: { windowMs: 60 * 60 * 1000, maxRequests: 1000 } // 1000 per hour
  },
  enterprise: {
    aiRequests: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 1000 }, // 1000 per day
    websites: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 100 }, // 100 per day
    apiCalls: { windowMs: 60 * 60 * 1000, maxRequests: 10000 } // 10000 per hour
  }
};

// Helper function for easy rate limiting in API routes
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters,
  customLimit?: number,
  customWindow?: number
): Promise<{ success: boolean; headers: Record<string, string>; error?: string }> {
  let limiter = rateLimiters[type];
  
  // Create custom limiter if specified
  if (customLimit || customWindow) {
    limiter = new RateLimiter({
      windowMs: customWindow ? customWindow * 1000 : 60000,
      maxRequests: customLimit || 100
    });
  }
  
  const result = await limiter.checkLimit(request);
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  };
  
  if (!result.allowed) {
    headers['Retry-After'] = result.retryAfter?.toString() || '60';
    return {
      success: false,
      headers,
      error: 'Rate limit exceeded'
    };
  }
  
  return { success: true, headers };
}

// Export user rate limiter instance
export const userRateLimiter = new UserRateLimiter();

export default RateLimiter;

