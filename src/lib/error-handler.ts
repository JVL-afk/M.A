import { NextRequest, NextResponse } from 'next/server';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  SERVER = 'SERVER_ERROR',
  NETWORK = 'NETWORK_ERROR'
}

// Custom error class with enhanced properties
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.metadata = metadata;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error creators for common scenarios
export class ErrorFactory {
  static validation(message: string, field?: string): AppError {
    return new AppError(
      message,
      ErrorType.VALIDATION,
      400,
      true,
      { field }
    );
  }
  
  static authentication(message: string = 'Authentication required'): AppError {
    return new AppError(
      message,
      ErrorType.AUTHENTICATION,
      401,
      true
    );
  }
  
  static authorization(message: string = 'Insufficient permissions'): AppError {
    return new AppError(
      message,
      ErrorType.AUTHORIZATION,
      403,
      true
    );
  }
  
  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(
      `${resource} not found`,
      ErrorType.NOT_FOUND,
      404,
      true,
      { resource }
    );
  }
  
  static rateLimit(message: string = 'Rate limit exceeded'): AppError {
    return new AppError(
      message,
      ErrorType.RATE_LIMIT,
      429,
      true
    );
  }
  
  static database(message: string, operation?: string): AppError {
    return new AppError(
      message,
      ErrorType.DATABASE,
      500,
      true,
      { operation }
    );
  }
  
  static externalAPI(service: string, message?: string): AppError {
    return new AppError(
      message || `External service ${service} unavailable`,
      ErrorType.EXTERNAL_API,
      502,
      true,
      { service }
    );
  }
  
  static payment(message: string, paymentId?: string): AppError {
    return new AppError(
      message,
      ErrorType.PAYMENT,
      402,
      true,
      { paymentId }
    );
  }
  
  static server(message: string = 'Internal server error'): AppError {
    return new AppError(
      message,
      ErrorType.SERVER,
      500,
      false
    );
  }
}

// Error logging service
export class ErrorLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private static isProduction = process.env.NODE_ENV === 'production';
  
  static async logError(error: Error | AppError, context?: {
    requestId?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  }): Promise<void> {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      type: error instanceof AppError ? error.type : ErrorType.SERVER,
      statusCode: error instanceof AppError ? error.statusCode : 500,
      isOperational: error instanceof AppError ? error.isOperational : false,
      metadata: error instanceof AppError ? error.metadata : undefined,
      context
    };
    
    // Console logging for development
    if (this.isDevelopment) {
      console.error('🚨 Error occurred:', errorInfo);
    }
    
    // Production logging (integrate with external services)
    if (this.isProduction) {
      try {
        // Log to external service (Sentry, LogRocket, etc.)
        await this.logToExternalService(errorInfo);
        
        // Log to database for analysis
        await this.logToDatabase(errorInfo);
      } catch (loggingError) {
        console.error('Failed to log error:', loggingError);
      }
    }
  }
  
  private static async logToExternalService(errorInfo: any): Promise<void> {
    // Integrate with Sentry or similar service
    if (process.env.SENTRY_DSN) {
      try {
        // Sentry integration would go here
        console.log('Logging to Sentry:', errorInfo.message);
      } catch (error) {
        console.error('Sentry logging failed:', error);
      }
    }
  }
  
  private static async logToDatabase(errorInfo: any): Promise<void> {
    try {
      // Store error in database for analysis
      const { connectToDatabase } = await import('./mongodb');
      const { db } = await connectToDatabase();
      
      await db.collection('error_logs').insertOne({
        ...errorInfo,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Database error logging failed:', error);
    }
  }
}

// Global error handler for API routes
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      // Add request ID to headers for tracking
      const response = await handler(request, context);
      
      // Add performance and tracking headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
      
      return response;
    } catch (error) {
      // Extract request context
      const context = {
        requestId,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip
      };
      
      // Log the error
      await ErrorLogger.logError(error as Error, context);
      
      // Return appropriate error response
      return handleErrorResponse(error as Error, requestId);
    }
  };
}

// Error response handler
export function handleErrorResponse(error: Error, requestId?: string): NextResponse {
  let statusCode = 500;
  let message = 'Internal server error';
  let type = ErrorType.SERVER;
  let details: any = undefined;
  
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    type = error.type;
    
    // Include additional details in development
    if (process.env.NODE_ENV === 'development') {
      details = {
        type: error.type,
        metadata: error.metadata,
        stack: error.stack
      };
    }
  }
  
  // Security: Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
  }
  
  const errorResponse = {
    success: false,
    error: {
      message,
      type,
      timestamp: new Date().toISOString(),
      requestId,
      ...(details && { details })
    }
  };
  
  const response = NextResponse.json(errorResponse, { status: statusCode });
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  if (requestId) {
    response.headers.set('X-Request-ID', requestId);
  }
  
  return response;
}

// Input validation helpers
export class ValidationHelper {
  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw ErrorFactory.validation(`${fieldName} is required`);
    }
  }
  
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw ErrorFactory.validation('Invalid email format', 'email');
    }
  }
  
  static validateLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw ErrorFactory.validation(
        `${fieldName} must be between ${min} and ${max} characters`,
        fieldName
      );
    }
  }
  
  static validateEnum<T>(value: T, allowedValues: T[], fieldName: string): void {
    if (!allowedValues.includes(value)) {
      throw ErrorFactory.validation(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        fieldName
      );
    }
  }
  
  static validateObjectId(id: string, fieldName: string = 'id'): void {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      throw ErrorFactory.validation(`Invalid ${fieldName} format`, fieldName);
    }
  }
  
  static validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value <= 0) {
      throw ErrorFactory.validation(`${fieldName} must be a positive number`, fieldName);
    }
  }
  
  static validateUrl(url: string, fieldName: string = 'url'): void {
    try {
      new URL(url);
    } catch {
      throw ErrorFactory.validation(`Invalid ${fieldName} format`, fieldName);
    }
  }
}

// Async error wrapper for database operations
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Convert database errors to AppError
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw ErrorFactory.validation('Resource already exists');
        }
        if (error.message.includes('validation failed')) {
          throw ErrorFactory.validation('Invalid data provided');
        }
        if (error.message.includes('connection')) {
          throw ErrorFactory.database('Database connection failed');
        }
      }
      
      // Unknown error
      throw ErrorFactory.server('An unexpected error occurred');
    }
  };
}

// Health check error monitoring
export class HealthMonitor {
  private static errorCounts = new Map<ErrorType, number>();
  private static lastReset = Date.now();
  private static readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 hour
  
  static recordError(type: ErrorType): void {
    // Reset counts every hour
    if (Date.now() - this.lastReset > this.RESET_INTERVAL) {
      this.errorCounts.clear();
      this.lastReset = Date.now();
    }
    
    const current = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, current + 1);
  }
  
  static getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, count] of Array.from(this.errorCounts.entries())) {
      stats[type] = count;
    }
    return stats;
  }
  
  static isHealthy(): boolean {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const criticalErrors = (this.errorCounts.get(ErrorType.DATABASE) || 0) + 
                          (this.errorCounts.get(ErrorType.EXTERNAL_API) || 0);
    
    // Consider unhealthy if too many errors
    return totalErrors < 100 && criticalErrors < 10;
  }
}

// Export everything
export default {
  AppError,
  ErrorFactory,
  ErrorLogger,
  withErrorHandler,
  handleErrorResponse,
  ValidationHelper,
  asyncErrorHandler,
  HealthMonitor
};
