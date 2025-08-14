import { MongoClient } from 'mongodb';

// Fixed MongoDB URI with correct password case: Andrei18 (uppercase A)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://andreiairolu2019:Andrei18@affilifycluster.pnphx.mongodb.net/affilify?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// Optimized MongoDB connection options for serverless environments
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000, // Increased from 5000ms to 30000ms (30 seconds)
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // Added connection timeout
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  retryReads: true,
  // Removed deprecated bufferMaxEntries parameter
};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, mongoOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, mongoOptions);
  clientPromise = client.connect();
}

// Export all the functions that API routes need
export { clientPromise };
export default clientPromise;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('affilify');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Add retry logic for connection failures
    if (error instanceof Error && error.message.includes('Server selection timed out')) {
      console.log('Retrying MongoDB connection...');
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const client = await clientPromise;
        const db = client.db('affilify');
        return { client, db };
      } catch (retryError) {
        console.error('MongoDB retry connection failed:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
}

export async function getDatabase() {
  try {
    const client = await clientPromise;
    return client.db('affilify');
  } catch (error) {
    console.error('Failed to get database:', error);
    throw error;
  }
}

// Additional utility functions for common database operations
export async function getUserCollection() {
  try {
    const db = await getDatabase();
    return db.collection('users');
  } catch (error) {
    console.error('Failed to get user collection:', error);
    throw error;
  }
}

export async function getWebsiteCollection() {
  try {
    const db = await getDatabase();
    return db.collection('websites');
  } catch (error) {
    console.error('Failed to get website collection:', error);
    throw error;
  }
}

export async function getAnalyticsCollection() {
  try {
    const db = await getDatabase();
    return db.collection('analytics');
  } catch (error) {
    console.error('Failed to get analytics collection:', error);
    throw error;
  }
}

// Health check function to test MongoDB connection
export async function testConnection() {
  try {
    const { client, db } = await connectToDatabase();
    await db.admin().ping();
    console.log('MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}
