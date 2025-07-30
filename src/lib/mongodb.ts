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
    // Create new connection with optimized settings
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      retryWrites: true,
      retryReads: true
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

// Graceful shutdown handler
process.on('SIGINT', async () => {
  if (cachedClient) {
    await cachedClient.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});

