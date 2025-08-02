// FIXED MongoDB Connection - Replace /home/ubuntu/AFFILIFY/src/lib/mongodb.ts
// This removes the deprecated bufferMaxEntries parameter that's causing the error

import { MongoClient, Db } from 'mongodb';

interface ConnectionResult {
  client: MongoClient;
  db: Db;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<ConnectionResult> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    try {
      // Test the connection
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('Cached connection failed, creating new connection');
      cachedClient = null;
      cachedDb = null;
    }
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    // Create new connection with modern MongoDB driver options
    // REMOVED: bufferMaxEntries (deprecated parameter causing the error)
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // bufferMaxEntries: 0, // ❌ REMOVED - This is deprecated and causes errors
      retryWrites: true,
      retryReads: true,
      // Modern connection options
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
    });

    await client.connect();
    
    const db = client.db('affilify');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log('Successfully connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Helper function to get database instance
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Helper function to get specific collection
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  if (cachedClient) {
    await cachedClient.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});


