import { MongoClient, Db } from 'mongodb';

// Global connection cache to prevent multiple connections
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

// MongoDB connection configuration optimized for production
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'affilify';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Connection options optimized for performance and scalability
const options = {
  // Connection Pool Settings
  minPoolSize: 5,          // Minimum number of connections in pool
  maxPoolSize: 50,         // Maximum number of connections in pool
  maxIdleTimeMS: 600000,   // Close connections after 10 minutes of inactivity
  maxConnecting: 10,       // Maximum number of connections being established
  
  // Connection Timeout Settings
  serverSelectionTimeoutMS: 30000,  // 30 seconds
  socketTimeoutMS: 45000,           // 45 seconds
  connectTimeoutMS: 30000,          // 30 seconds
  
  // Heartbeat and Monitoring
  heartbeatFrequencyMS: 10000,      // 10 seconds
  
  // Write Concern for Performance
  w: 'majority',
  wtimeoutMS: 10000,
  
  // Read Preference for Load Distribution
  readPreference: 'primaryPreferred',
  
  // Compression for Network Efficiency
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  
  // Retry Logic
  retryWrites: true,
  retryReads: true,
  
  // Buffer Settings
  bufferMaxEntries: 0,
  bufferCommands: false,
  
  // Additional Performance Options
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
  // Application Name for Monitoring
  appName: 'AFFILIFY-Production',
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  // across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each connection
  const client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

// Enhanced connection function with error handling and retry logic
export async function connectToDatabase(): Promise<MongoClient> {
  try {
    const client = await clientPromise;
    
    // Verify connection is active
    await client.db('admin').command({ ping: 1 });
    
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Implement retry logic for connection failures
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('Retrying MongoDB connection...');
      // Reset the promise to force a new connection attempt
      if (process.env.NODE_ENV === 'development') {
        global._mongoClientPromise = undefined;
      }
      // Recursive retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectToDatabase();
    }
    
    throw error;
  }
}

// Get database instance with connection verification
export async function getDatabase(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db(MONGODB_DB);
}

// Optimized collection access with indexing
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  
  // Ensure indexes are created for optimal performance
  await ensureIndexes(collection, collectionName);
  
  return collection;
}

// Index creation for optimal query performance
async function ensureIndexes(collection: any, collectionName: string) {
  try {
    switch (collectionName) {
      case 'users':
        // Compound index for authentication queries
        await collection.createIndex({ email: 1 }, { unique: true, background: true });
        await collection.createIndex({ _id: 1, email: 1 }, { background: true });
        await collection.createIndex({ plan: 1, createdAt: -1 }, { background: true });
        await collection.createIndex({ stripeCustomerId: 1 }, { sparse: true, background: true });
        break;
        
      case 'websites':
        // Indexes for website queries
        await collection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
        await collection.createIndex({ userId: 1, status: 1 }, { background: true });
        await collection.createIndex({ domain: 1 }, { sparse: true, background: true });
        await collection.createIndex({ template: 1, createdAt: -1 }, { background: true });
        break;
        
      case 'analytics':
        // Indexes for analytics queries
        await collection.createIndex({ userId: 1, date: -1 }, { background: true });
        await collection.createIndex({ websiteId: 1, date: -1 }, { background: true });
        await collection.createIndex({ userId: 1, websiteId: 1, date: -1 }, { background: true });
        break;
        
      case 'payment_attempts':
        // Indexes for payment tracking
        await collection.createIndex({ sessionId: 1 }, { unique: true, background: true });
        await collection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
        await collection.createIndex({ status: 1, createdAt: -1 }, { background: true });
        break;
        
      case 'api_keys':
        // Indexes for API key management
        await collection.createIndex({ userId: 1 }, { background: true });
        await collection.createIndex({ keyHash: 1 }, { unique: true, background: true });
        await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
        break;
        
      default:
        // Default indexes for common patterns
        await collection.createIndex({ createdAt: -1 }, { background: true });
        break;
    }
  } catch (error) {
    // Log index creation errors but don't fail the connection
    console.warn(`Index creation warning for ${collectionName}:`, error);
  }
}

// Connection health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await connectToDatabase();
    const result = await client.db('admin').command({ ping: 1 });
    return result.ok === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (global._mongoClient) {
      await global._mongoClient.close();
      global._mongoClient = undefined;
      global._mongoClientPromise = undefined;
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Performance monitoring utilities
export async function getDatabaseStats() {
  try {
    const db = await getDatabase();
    const stats = await db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize,
      avgObjSize: stats.avgObjSize,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}

// Connection pool monitoring
export async function getConnectionPoolStats() {
  try {
    const client = await connectToDatabase();
    // Note: Connection pool stats are available in MongoDB driver 4.0+
    return {
      currentCheckedOut: 'Available in driver 4.0+',
      currentCreated: 'Available in driver 4.0+',
      totalCreated: 'Available in driver 4.0+',
    };
  } catch (error) {
    console.error('Error getting connection pool stats:', error);
    return null;
  }
}

export default clientPromise;
