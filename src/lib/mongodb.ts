import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// Global MongoDB connection cache
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

// Production-optimized MongoDB configuration
const MONGODB_OPTIONS: MongoClientOptions = {
  // Connection Pool Settings for High Concurrency
  maxPoolSize: 50, // Maximum number of connections in the pool
  minPoolSize: 5,  // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  
  // Server Selection and Timeout Settings
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
  connectTimeoutMS: 10000, // How long to wait for a connection to be established
  
  // Heartbeat and Monitoring
  heartbeatFrequencyMS: 10000, // How often to check server status
  
  // Write Concern for Data Durability
  writeConcern: {
    w: 'majority', // Wait for majority of replica set members
    j: true, // Wait for journal acknowledgment
    wtimeout: 5000 // Timeout for write concern
  },
  
  // Read Preference for Load Distribution
  readPreference: 'secondaryPreferred', // Prefer secondary for reads
  
  // Compression for Network Efficiency
  compressors: ['snappy', 'zlib'],
  
  // Retry Logic
  retryWrites: true,
  retryReads: true,
  
  // Buffer Settings
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false,
  
  // SSL/TLS Settings for Production
  ssl: true,
  sslValidate: true,
  
  // Application Name for Monitoring
  appName: 'AFFILIFY-Production'
};

// Environment-specific configuration
const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'affilify';
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }
  
  // Validate URI format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }
  
  return { uri, dbName };
};

// Enhanced connection function with retry logic
export async function connectToDatabase(): Promise<MongoConnection> {
  // Return cached connection if available
  if (cachedConnection) {
    try {
      // Ping to ensure connection is still alive
      await cachedConnection.client.db('admin').command({ ping: 1 });
      return cachedConnection;
    } catch (error) {
      console.warn('Cached MongoDB connection failed ping, reconnecting...', error);
      cachedConnection = null;
    }
  }
  
  const { uri, dbName } = getMongoConfig();
  
  try {
    console.log('Establishing new MongoDB connection...');
    
    // Create new client with production options
    const client = new MongoClient(uri, MONGODB_OPTIONS);
    
    // Connect with timeout
    await client.connect();
    
    // Verify connection
    await client.db('admin').command({ ping: 1 });
    
    const db = client.db(dbName);
    
    // Create connection object
    const connection: MongoConnection = { client, db };
    
    // Cache the connection
    cachedConnection = connection;
    
    console.log('MongoDB connected successfully');
    
    // Set up connection event listeners
    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      cachedConnection = null;
    });
    
    client.on('close', () => {
      console.log('MongoDB connection closed');
      cachedConnection = null;
    });
    
    // Initialize database indexes on first connection
    await initializeIndexes(db);
    
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize database indexes for optimal performance
async function initializeIndexes(db: Db): Promise<void> {
  try {
    console.log('Initializing database indexes...');
    
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true, background: true });
    await usersCollection.createIndex({ 'subscription.plan': 1, 'subscription.status': 1 }, { background: true });
    await usersCollection.createIndex({ createdAt: 1 }, { background: true });
    await usersCollection.createIndex({ lastLogin: 1 }, { background: true });
    
    // Content/Websites collection indexes
    const websitesCollection = db.collection('websites');
    await websitesCollection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await websitesCollection.createIndex({ userId: 1, status: 1 }, { background: true });
    await websitesCollection.createIndex({ 'metadata.niche': 1 }, { background: true });
    
    // Payments collection indexes
    const paymentsCollection = db.collection('payments');
    await paymentsCollection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await paymentsCollection.createIndex({ stripePaymentId: 1 }, { unique: true, background: true });
    await paymentsCollection.createIndex({ status: 1, createdAt: -1 }, { background: true });
    
    // Sessions collection indexes (for session management)
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.createIndex({ userId: 1 }, { background: true });
    await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
    
    // Analytics collection indexes
    const analyticsCollection = db.collection('analytics');
    await analyticsCollection.createIndex({ userId: 1, date: -1 }, { background: true });
    await analyticsCollection.createIndex({ event: 1, createdAt: -1 }, { background: true });
    
    // API Usage tracking indexes
    const apiUsageCollection = db.collection('api_usage');
    await apiUsageCollection.createIndex({ userId: 1, date: -1 }, { background: true });
    await apiUsageCollection.createIndex({ service: 1, userId: 1, date: -1 }, { background: true });
    
    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing indexes:', error);
    // Don't throw error here as indexes are not critical for basic functionality
  }
}

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connected: boolean;
    responseTime: number;
    collections: number;
    indexes: number;
  };
}> {
  try {
    const startTime = Date.now();
    const { client, db } = await connectToDatabase();
    
    // Test basic operations
    await db.admin().ping();
    const responseTime = Date.now() - startTime;
    
    // Get database stats
    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    // Count total indexes
    let totalIndexes = 0;
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      totalIndexes += indexes.length;
    }
    
    return {
      status: 'healthy',
      details: {
        connected: true,
        responseTime,
        collections: collections.length,
        indexes: totalIndexes
      }
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      details: {
        connected: false,
        responseTime: -1,
        collections: 0,
        indexes: 0
      }
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
  
  // Bulk operations helper
  static async bulkWrite(collection: any, operations: any[]): Promise<any> {
    if (operations.length === 0) return null;
    
    return collection.bulkWrite(operations, {
      ordered: false, // Allow partial failures
      writeConcern: { w: 'majority', j: true }
    });
  }
  
  // Transaction helper
  static async withTransaction<T>(
    operation: (session: any) => Promise<T>
  ): Promise<T> {
    const { client } = await connectToDatabase();
    const session = client.startSession();
    
    try {
      return await session.withTransaction(operation, {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true },
        readPreference: 'primary'
      });
    } finally {
      await session.endSession();
    }
  }
}

// Export default connection function
export default { connectToDatabase };

// Performance monitoring
export class MongoPerformanceMonitor {
  private static slowQueryThreshold = 100; // ms
  
  static async logSlowQueries(db: Db): Promise<void> {
    try {
      // Enable profiling for slow operations
      await db.admin().command({
        profile: 2,
        slowms: this.slowQueryThreshold
      });
      
      console.log(`MongoDB profiling enabled for queries slower than ${this.slowQueryThreshold}ms`);
    } catch (error) {
      console.error('Failed to enable MongoDB profiling:', error);
    }
  }
  
  static async getPerformanceStats(db: Db): Promise<any> {
    try {
      const stats = await db.stats();
      const serverStatus = await db.admin().command({ serverStatus: 1 });
      
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        connections: serverStatus.connections,
        opcounters: serverStatus.opcounters,
        memory: serverStatus.mem
      };
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return null;
    }
  }
}
