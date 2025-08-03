// 🚀 FIXED MONGODB LIBRARY - lib/mongodb.ts
// This file exports all the functions that other files are looking for

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  clientPromise = client.connect();
}

// Export the default promise
export { clientPromise };
export default clientPromise;

// Export the function that other files are looking for
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('affilify');
    
    return {
      client,
      db
    };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Additional helper functions for common operations
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('affilify');
}

export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
