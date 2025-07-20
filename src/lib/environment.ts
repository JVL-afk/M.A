import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_DB: z.string().default('affilify'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  
  // Stripe Price IDs
  STRIPE_PRO_PRICE_ID: z.string().min(1, 'Stripe Pro price ID is required'),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().min(1, 'Stripe Enterprise price ID is required'),
  
  // Google AI
  GOOGLE_AI_API_KEY: z.string().min(1, 'Google AI API key is required'),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters').optional(),
  
  // Rate limiting
  RATE_LIMIT_REDIS_URL: z.string().optional(),
  
  // File uploads (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

// Environment configuration type
export type Environment = z.infer<typeof envSchema>;

// Validate and parse environment variables
function validateEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Cached environment configuration
let cachedEnv: Environment | null = null;

// Get validated environment configuration
export function getEnvironment(): Environment {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment();
  }
  return cachedEnv;
}

// Environment-specific configurations
export class EnvironmentConfig {
  private static env = getEnvironment();
  
  // Database configuration
  static get database() {
    return {
      uri: this.env.MONGODB_URI,
      name: this.env.MONGODB_DB,
      options: {
        maxPoolSize: this.env.NODE_ENV === 'production' ? 50 : 10,
        minPoolSize: this.env.NODE_ENV === 'production' ? 5 : 1,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeout: 5000
        }
      }
    };
  }
  
  // Authentication configuration
  static get auth() {
    return {
      jwtSecret: this.env.JWT_SECRET,
      jwtRefreshSecret: this.env.JWT_REFRESH_SECRET || this.env.JWT_SECRET,
      accessTokenExpiry: this.env.NODE_ENV === 'production' ? '15m' : '1h',
      refreshTokenExpiry: '7d',
      passwordSaltRounds: 12,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionDuration: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
  }
  
  // Stripe configuration
  static get stripe() {
    return {
      secretKey: this.env.STRIPE_SECRET_KEY,
      webhookSecret: this.env.STRIPE_WEBHOOK_SECRET,
      publishableKey: this.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      proPriceId: this.env.STRIPE_PRO_PRICE_ID,
      enterprisePriceId: this.env.STRIPE_ENTERPRISE_PRICE_ID,
      apiVersion: '2024-06-20' as const
    };
  }
  
  // Google AI configuration
  static get googleAI() {
    return {
      apiKey: this.env.GOOGLE_AI_API_KEY,
      model: 'gemini-1.5-flash',
      maxTokens: 8192,
      temperature: 0.7,
      rateLimits: {
        free: { requests: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
        pro: { requests: 100, window: 24 * 60 * 60 * 1000 }, // 100 per day
        enterprise: { requests: 1000, window: 24 * 60 * 60 * 1000 } // 1000 per day
      }
    };
  }
  
  // Redis configuration
  static get redis() {
    return {
      url: this.env.REDIS_URL || this.env.UPSTASH_REDIS_REST_URL,
      token: this.env.UPSTASH_REDIS_REST_TOKEN,
      enabled: !!(this.env.REDIS_URL || this.env.UPSTASH_REDIS_REST_URL),
      defaultTTL: 3600, // 1 hour
      keyPrefix: 'affilify:'
    };
  }
  
  // Application configuration
  static get app() {
    return {
      url: this.env.NEXT_PUBLIC_APP_URL,
      environment: this.env.NODE_ENV,
      isDevelopment: this.env.NODE_ENV === 'development',
      isProduction: this.env.NODE_ENV === 'production',
      isTest: this.env.NODE_ENV === 'test',
      vercelUrl: this.env.VERCEL_URL
    };
  }
  
  // Email configuration
  static get email() {
    return {
      enabled: !!(this.env.SMTP_HOST && this.env.SMTP_USER && this.env.SMTP_PASS),
      host: this.env.SMTP_HOST,
      port: parseInt(this.env.SMTP_PORT || '587'),
      user: this.env.SMTP_USER,
      pass: this.env.SMTP_PASS,
      from: this.env.SMTP_USER || 'noreply@affilify.com'
    };
  }
  
  // Monitoring configuration
  static get monitoring() {
    return {
      sentryDsn: this.env.SENTRY_DSN,
      enabled: !!this.env.SENTRY_DSN,
      environment: this.env.NODE_ENV,
      tracesSampleRate: this.env.NODE_ENV === 'production' ? 0.1 : 1.0
    };
  }
  
  // Security configuration
  static get security() {
    return {
      encryptionKey: this.env.ENCRYPTION_KEY || this.env.JWT_SECRET,
      corsOrigins: this.env.NODE_ENV === 'production' 
        ? [this.env.NEXT_PUBLIC_APP_URL]
        : ['http://localhost:3000', 'http://localhost:3001'],
      rateLimiting: {
        enabled: true,
        redisUrl: this.env.RATE_LIMIT_REDIS_URL || this.env.REDIS_URL,
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100
      },
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    };
  }
  
  // File upload configuration
  static get uploads() {
    return {
      enabled: !!(this.env.AWS_ACCESS_KEY_ID && this.env.AWS_SECRET_ACCESS_KEY),
      aws: {
        accessKeyId: this.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.env.AWS_SECRET_ACCESS_KEY,
        region: this.env.AWS_REGION || 'us-east-1',
        bucket: this.env.AWS_S3_BUCKET
      },
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    };
  }
  
  // Rate limiting configuration by subscription
  static get subscriptionLimits() {
    return {
      free: {
        websites: { max: 3, window: 24 * 60 * 60 * 1000 }, // 3 per day
        aiRequests: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
        apiCalls: { max: 100, window: 60 * 60 * 1000 } // 100 per hour
      },
      pro: {
        websites: { max: 20, window: 24 * 60 * 60 * 1000 }, // 20 per day
        aiRequests: { max: 100, window: 24 * 60 * 60 * 1000 }, // 100 per day
        apiCalls: { max: 1000, window: 60 * 60 * 1000 } // 1000 per hour
      },
      enterprise: {
        websites: { max: 100, window: 24 * 60 * 60 * 1000 }, // 100 per day
        aiRequests: { max: 1000, window: 24 * 60 * 60 * 1000 }, // 1000 per day
        apiCalls: { max: 10000, window: 60 * 60 * 1000 } // 10000 per hour
      }
    };
  }
}

// Environment validation on module load
try {
  getEnvironment();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Helper functions
export function isDevelopment(): boolean {
  return EnvironmentConfig.app.isDevelopment;
}

export function isProduction(): boolean {
  return EnvironmentConfig.app.isProduction;
}

export function isTest(): boolean {
  return EnvironmentConfig.app.isTest;
}

export function getAppUrl(): string {
  return EnvironmentConfig.app.url;
}

export function getDatabaseUrl(): string {
  return EnvironmentConfig.database.uri;
}

export function getJwtSecret(): string {
  return EnvironmentConfig.auth.jwtSecret;
}

export function getStripeConfig() {
  return EnvironmentConfig.stripe;
}

export function getRedisConfig() {
  return EnvironmentConfig.redis;
}

// Environment health check
export function checkEnvironmentHealth(): {
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  config: Record<string, boolean>;
} {
  const issues: string[] = [];
  const config: Record<string, boolean> = {};
  
  // Check required services
  config.database = !!EnvironmentConfig.database.uri;
  config.auth = !!EnvironmentConfig.auth.jwtSecret;
  config.stripe = !!(EnvironmentConfig.stripe.secretKey && EnvironmentConfig.stripe.webhookSecret);
  config.googleAI = !!EnvironmentConfig.googleAI.apiKey;
  
  // Check optional services
  config.redis = EnvironmentConfig.redis.enabled;
  config.email = EnvironmentConfig.email.enabled;
  config.monitoring = EnvironmentConfig.monitoring.enabled;
  config.uploads = EnvironmentConfig.uploads.enabled;
  
  // Identify issues
  if (!config.database) issues.push('Database configuration missing');
  if (!config.auth) issues.push('Authentication configuration incomplete');
  if (!config.stripe) issues.push('Stripe configuration incomplete');
  if (!config.googleAI) issues.push('Google AI configuration missing');
  
  // Warnings for optional services
  if (!config.redis) issues.push('Redis not configured (rate limiting will use memory)');
  if (!config.email) issues.push('Email service not configured');
  if (!config.monitoring) issues.push('Monitoring not configured');
  
const status = issues.length === 0 ? 'healthy' :
                issues.some(issue => issue.includes('missing') || issue.includes('incomplete')) ? 'error' : 'warning';

    
