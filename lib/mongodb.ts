import { MongoClient, MongoClientOptions, Db } from 'mongodb';

// Check if we're in a browser environment (Edge Runtime)
const isBrowser = typeof window !== 'undefined';
const isEdgeRuntime = !isBrowser && typeof process.env.NEXT_RUNTIME === 'string' && process.env.NEXT_RUNTIME === 'edge';

// Connection URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'affilify';

// Connection options
const options: MongoClientOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  // Only use compressors in Node.js environment, not in Edge Runtime
  ...(isEdgeRuntime ? {} : { compressors: ['zlib'] as ('zlib' | 'none' | 'snappy' | 'zstd')[] })
};

// Global MongoDB client reference
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    return { client, db };
  } catch (error) {
    console.error('MONGODB_CONNECTION_ERROR:', error);
    throw new Error('Failed to connect to database');
  }
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { client } = await connectToDatabase();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MONGODB_HEALTH_CHECK_ERROR:', error);
    return false;
  }
}

// Create indexes function - can be called during app initialization
export async function createIndexes(): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    
    // Create indexes for common collections
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('websites').createIndex({ userId: 1 });
    await db.collection('analytics').createIndex({ websiteId: 1, date: 1 });
    await db.collection('team_members').createIndex({ organizationId: 1 });
    await db.collection('api_keys').createIndex({ userId: 1 });
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('MONGODB_INDEX_CREATION_ERROR:', error);
  }
}
