import { MongoClient } from 'mongodb';

// Fixed MongoDB URI with correct password case: Andrei18 (uppercase A)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://andreimiroiu2019:Andrei18@affilifycluster.ppnplhx.mongodb.net/affilify?retryWrites=true&w=majority&appName=AffilifyCluster';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Removed deprecated bufferMaxEntries parameter
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Removed deprecated bufferMaxEntries parameter
  });
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
    throw error;
  }
}

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('affilify');
}

// Additional utility functions for common database operations
export async function getUserCollection() {
  const db = await getDatabase();
  return db.collection('users');
}

export async function getWebsiteCollection() {
  const db = await getDatabase();
  return db.collection('websites');
}

export async function getAnalyticsCollection() {
  const db = await getDatabase();
  return db.collection('analytics');
}

