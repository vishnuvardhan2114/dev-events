import mongoose, { type Connection, type ConnectOptions } from "mongoose";


interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local or .env"
  );
}

const connectionString: string = MONGODB_URI;

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

const CONNECTED_STATE = 1;
async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(connectionString, options)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      })
      .catch((error: Error) => {
        cached.promise = null;
        throw new Error(
          `Failed to connect to MongoDB: ${error.message || "Unknown error"}`
        );
      });
  }

  try {
    cached.conn = await cached.promise;
    
    if (cached.conn.readyState !== CONNECTED_STATE) {
      throw new Error("MongoDB connection established but not in connected state");
    }

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Failed to establish MongoDB connection");
  }
}

export default connectDB;

