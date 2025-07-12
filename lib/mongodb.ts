import { MongoClient, ServerApiVersion, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb+srv://andreimiroiu2019:Andrei18@affilifycluster.ppnplhx.mongodb.net/affilify?retryWrites=true&w=majority&appName=AffilifyCluster"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add SSL/TLS configuration to fix network errors
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Connection timeout and retry settings
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  // Retry settings
  retryWrites: true,
  retryReads: true,
})

let isConnected = false

export async function connectToDatabase(): Promise<MongoClient> {
  if (isConnected) {
    return client
  }

  try {
    // Connect the client to the server
    await client.connect()
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log("Successfully connected to MongoDB!")
    
    isConnected = true
    return client
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    
    // If connection fails, try with alternative connection string
    const fallbackUri = "mongodb+srv://andreimiroiu2019:Andrei18@affilifycluster.ppnplhx.mongodb.net/affilify?retryWrites=true&w=majority&appName=AffilifyCluster"
    
    try {
      const fallbackClient = new MongoClient(fallbackUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        tls: true,
        tlsAllowInvalidCertificates: false,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      })
      
      await fallbackClient.connect()
      await fallbackClient.db("admin").command({ ping: 1 })
      console.log("Connected to MongoDB using fallback connection!")
      
      isConnected = true
      return fallbackClient
    } catch (fallbackError) {
      console.error("Fallback connection also failed:", fallbackError)
      throw new Error("Unable to connect to MongoDB with both primary and fallback connections")
    }
  }
}

export async function getDatabase(dbName: string = 'affilify'): Promise<Db> {
  const client = await connectToDatabase()
  return client.db(dbName)
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await client.close()
    console.log('MongoDB connection closed.')
    process.exit(0)
  }
})

export default client

