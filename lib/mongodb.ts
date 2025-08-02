// lib/mongodb.ts - CORRECTED VERSION
// This fixes the "buffermaxentries is not supported" error

import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

// Modern MongoDB connection options (no deprecated parameters)
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // Note: bufferMaxEntries and bufferCommands are Mongoose-specific, not MongoDB driver options
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

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

// Export the promise for use in API routes
export default clientPromise;

// Helper function to get database instance
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('affilify'); // Use your database name
}

// Helper function to get specific collection
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
