import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { withErrorHandler, ErrorFactory, ValidationHelper } from '../../../../lib/error-handler';
import { authenticateRequest, requirePremium } from '../../../../lib/auth-middleware';
import { rateLimit } from '../../../../lib/rate-limit';
import crypto from 'crypto';

// API Key utilities
class APIKeyUtils {
  // Generate secure API key
  static generateApiKey(): string {
    const prefix = 'ak_live_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return prefix + randomBytes;
  }
  
  // Hash API key for storage
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
  
  // Generate key preview for display
  static generateKeyPreview(apiKey: string): string {
    const prefix = apiKey.substring(0, 8);
    return prefix + '****';
  }
  
  // Validate API key format
  static validateApiKeyFormat(apiKey: string): boolean {
    return /^ak_live_[a-f0-9]{64}$/.test(apiKey);
  }
}

// Get user's API keys
async function getUserApiKeys(request: NextRequest): Promise<NextResponse> {
  // Authenticate user (premium feature)
  const user = await requirePremium(request);
  if (user instanceof NextResponse) return user;
  
  try {
    const { db } = await connectToDatabase();
    
    // Get user's API keys
    const apiKeys = await db.collection('api_keys').find({
      userId: user.id,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 }).toArray();
    
    // Format response (hide actual keys)
    const formattedKeys = apiKeys.map(key => ({
      id: key._id.toString(),
      name: key.name,
      keyPreview: key.keyPreview,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
      usageCount: key.usageCount || 0,
      rateLimit: key.rateLimit || { requests: 1000, window: 3600000 } // 1000 per hour default
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedKeys
    });
    
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw ErrorFactory.database('Failed to fetch API keys');
  }
}

// Create new API key
async function createApiKey(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const rateLimitResult = await rateLimit(request, 'api', 5, 60); // 5 per minute
  if (!rateLimitResult.success) {
    throw ErrorFactory.rateLimit('Too many API key creation attempts');
  }
  
  // Authenticate user (premium feature)
  const user = await requirePremium(request);
  if (user instanceof NextResponse) return user;
  
  const body = await request.json();
  
  // Validate request body
  ValidationHelper.validateRequired(body.name, 'name');
  ValidationHelper.validateLength(body.name, 1, 100, 'name');
  
  const { name, rateLimit: customRateLimit } = body;
  
  try {
    const { db } = await connectToDatabase();
    
    // Check API key limit based on subscription
    const existingKeysCount = await db.collection('api_keys').countDocuments({
      userId: user.id,
      isDeleted: { $ne: true }
    });
    
    const maxKeys = user.subscription.plan === 'pro' ? 5 : 10; // Pro: 5, Enterprise: 10
    if (existingKeysCount >= maxKeys) {
      throw ErrorFactory.validation(`Maximum ${maxKeys} API keys allowed for ${user.subscription.plan} plan`);
    }
    
    // Generate API key
    const apiKey = APIKeyUtils.generateApiKey();
    const hashedKey = APIKeyUtils.hashApiKey(apiKey);
    const keyPreview = APIKeyUtils.generateKeyPreview(apiKey);
    
    // Set rate limits based on subscription
    const defaultRateLimits = {
      pro: { requests: 1000, window: 3600000 }, // 1000 per hour
      enterprise: { requests: 10000, window: 3600000 } // 10000 per hour
    };
    
    const rateLimitConfig = customRateLimit || defaultRateLimits[user.subscription.plan];
    
    // Create API key record
    const apiKeyRecord = {
      userId: user.id,
      name: name.trim(),
      hashedKey,
      keyPreview,
      isActive: true,
      isDeleted: false,
      rateLimit: rateLimitConfig,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('api_keys').insertOne(apiKeyRecord);
    
    // Log API key creation
    await db.collection('api_key_logs').insertOne({
      userId: user.id,
      apiKeyId: result.insertedId,
      action: 'created',
      metadata: { name, rateLimit: rateLimitConfig },
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        name,
        apiKey, // Only returned once during creation
        keyPreview,
        rateLimit: rateLimitConfig,
        createdAt: apiKeyRecord.createdAt
      },
      message: 'API key created successfully. Save it securely - it won\'t be shown again.'
    });
    
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

// Update API key
async function updateApiKey(request: NextRequest): Promise<NextResponse> {
  const user = await requirePremium(request);
  if (user instanceof NextResponse) return user;
  
  const body = await request.json();
  
  // Validate request body
  ValidationHelper.validateRequired(body.id, 'id');
  ValidationHelper.validateObjectId(body.id, 'API key ID');
  
  const { id, name, isActive, rateLimit: newRateLimit } = body;
  
  try {
    const { db } = await connectToDatabase();
    
    // Find API key
    const apiKey = await db.collection('api_keys').findOne({
      _id: id,
      userId: user.id,
      isDeleted: { $ne: true }
    });
    
    if (!apiKey) {
      throw ErrorFactory.notFound('API key');
    }
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (name !== undefined) {
      ValidationHelper.validateLength(name, 1, 100, 'name');
      updateData.name = name.trim();
    }
    
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }
    
    if (newRateLimit !== undefined) {
      ValidationHelper.validatePositiveNumber(newRateLimit.requests, 'rate limit requests');
      ValidationHelper.validatePositiveNumber(newRateLimit.window, 'rate limit window');
      updateData.rateLimit = newRateLimit;
    }
    
    // Update API key
    await db.collection('api_keys').updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    // Log API key update
    await db.collection('api_key_logs').insertOne({
      userId: user.id,
      apiKeyId: id,
      action: 'updated',
      metadata: updateData,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'API key updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
}

// Delete API key
async function deleteApiKey(request: NextRequest): Promise<NextResponse> {
  const user = await requirePremium(request);
  if (user instanceof NextResponse) return user;
  
  const url = new URL(request.url);
  const keyId = url.searchParams.get('id');
  
  if (!keyId) {
    throw ErrorFactory.validation('API key ID is required');
  }
  
  ValidationHelper.validateObjectId(keyId, 'API key ID');
  
  try {
    const { db } = await connectToDatabase();
    
    // Find API key
    const apiKey = await db.collection('api_keys').findOne({
      _id: keyId,
      userId: user.id,
      isDeleted: { $ne: true }
    });
    
    if (!apiKey) {
      throw ErrorFactory.notFound('API key');
    }
    
    // Soft delete API key
    await db.collection('api_keys').updateOne(
      { _id: keyId },
      { 
        $set: { 
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    // Log API key deletion
    await db.collection('api_key_logs').insertOne({
      userId: user.id,
      apiKeyId: keyId,
      action: 'deleted',
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

// Get API key usage statistics
async function getApiKeyUsage(request: NextRequest): Promise<NextResponse> {
  const user = await requirePremium(request);
  if (user instanceof NextResponse) return user;
  
  const url = new URL(request.url);
  const keyId = url.searchParams.get('id');
  const days = parseInt(url.searchParams.get('days') || '30');
  
  if (!keyId) {
    throw ErrorFactory.validation('API key ID is required');
  }
  
  ValidationHelper.validateObjectId(keyId, 'API key ID');
  
  try {
    const { db } = await connectToDatabase();
    
    // Verify API key ownership
    const apiKey = await db.collection('api_keys').findOne({
      _id: keyId,
      userId: user.id
    });
    
    if (!apiKey) {
      throw ErrorFactory.notFound('API key');
    }
    
    // Get usage statistics
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const usage = await db.collection('api_usage').aggregate([
      {
        $match: {
          apiKeyId: keyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          requests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
          },
          failedRequests: {
            $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]).toArray();
    
    return NextResponse.json({
      success: true,
      data: {
        apiKey: {
          id: apiKey._id.toString(),
          name: apiKey.name,
          keyPreview: apiKey.keyPreview,
          totalUsage: apiKey.usageCount || 0,
          lastUsed: apiKey.lastUsed
        },
        usage,
        period: {
          days,
          startDate,
          endDate: new Date()
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching API key usage:', error);
    throw error;
  }
}

// Main route handler
async function handleApiKeyRequest(request: NextRequest): Promise<NextResponse> {
  const method = request.method;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (method) {
    case 'GET':
      if (action === 'usage') {
        return getApiKeyUsage(request);
      } else {
        return getUserApiKeys(request);
      }
      
    case 'POST':
      return createApiKey(request);
      
    case 'PUT':
      return updateApiKey(request);
      
    case 'DELETE':
      return deleteApiKey(request);
      
    default:
      throw ErrorFactory.validation(`Method ${method} not allowed`);
  }
}

// Export handlers with error handling
export const GET = withErrorHandler(handleApiKeyRequest);
export const POST = withErrorHandler(handleApiKeyRequest);
export const PUT = withErrorHandler(handleApiKeyRequest);
export const DELETE = withErrorHandler(handleApiKeyRequest);
