import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// Global MongoDB connection cache
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

// Optimized MongoDB configuration for Vercel deployment
const MONGODB_OPTIONS: MongoClientOptions = {
  // Connection Pool Settings - Reduced for serverless
  maxPoolSize: 10, // Reduced from 50 for serverless environment
  minPoolSize: 1,  // Reduced from 5 for serverless environment
  maxIdleTimeMS: 10000, // Reduced from 30000 for faster cleanup
  
  // Server Selection and Timeout Settings - Optimized for serverless
  serverSelectionTimeoutMS: 3000, // Reduced from 5000 for faster failures
  socketTimeoutMS: 20000, // Reduced from 45000 for serverless
  connectTimeoutMS: 5000, // Reduced from 10000 for faster startup
  
  // Heartbeat and Monitoring - Reduced frequency
  heartbeatFrequencyMS: 30000, // Increased from 10000 to reduce overhead
  
  // Write Concern for Data Durability
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 3000 // Reduced from 5000
  },
  
  // Read Preference for Load Distribution
  readPreference: 'primary', // Changed from secondaryPreferred for consistency
  
  // Compression for Network Efficiency
  compressors: ['snappy'],
  
  // Retry Logic
  retryWrites: true,
  retryReads: true,
  
  // SSL/TLS Settings for Production
  ssl: true,
  
  // Application Name for Monitoring
  appName: 'AFFILIFY-Vercel'
};

// Environment-specific configuration
const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'affilify';
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  
  return { uri, dbName };
};

// Enhanced connection function with retry logic and better error handling
export async function connectToDatabase(): Promise<MongoConnection> {
  // Return cached connection if available and healthy
  if (cachedConnection) {
    try {
      // Quick ping to ensure connection is still alive
      await cachedConnection.client.db('admin').command({ ping: 1 });
      return cachedConnection;
    } catch (error) {
      console.warn('Cached MongoDB connection failed, creating new connection');
      cachedConnection = null;
    }
  }
  
  const { uri, dbName } = getMongoConfig();
  
  try {
    // Create new client with optimized options
    const client = new MongoClient(uri, MONGODB_OPTIONS);
    
    // Connect with timeout
    await client.connect();
    
    // Verify connection with a simple ping
    await client.db('admin').command({ ping: 1 });
    
    const db = client.db(dbName);
    
    // Create connection object
    const connection: MongoConnection = { client, db };
    
    // Cache the connection
    cachedConnection = connection;
    
    // Set up connection event listeners for cleanup
    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      cachedConnection = null;
    });
    
    client.on('close', () => {
      console.log('MongoDB connection closed');
      cachedConnection = null;
    });
    
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Simplified database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
}> {
  try {
    const startTime = Date.now();
    const { client } = await connectToDatabase();
    
    // Test basic operations
    await client.db('admin').command({ ping: 1 });
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      responseTime: -1
    };
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedConnection) {
    try {
      await cachedConnection.client.close();
      cachedConnection = null;
      console.log('MongoDB connection closed gracefully');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

// Database utilities for common operations
export class DatabaseUtils {
  // Paginated query helper
  static async paginatedQuery<T>(
    collection: any,
    filter: object,
    options: {
      page: number;
      limit: number;
      sort?: object;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const { page, limit, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

// Create a client promise for compatibility with existing imports
const clientPromise = (async () => {
  const { client } = await connectToDatabase();
  return client;
})();

// Export clientPromise as default for compatibility
export default clientPromise;
