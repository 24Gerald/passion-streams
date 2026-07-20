import mongoose from "mongoose";
import { applySerializePlugin } from "../utils/serialize";

mongoose.plugin(applySerializePlugin);

let memoryServer: { stop: () => Promise<boolean> } | null = null;

async function resolveMongoUri(): Promise<string> {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is not defined");
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  memoryServer = mongod;
  const uri = mongod.getUri("passion_streams");
  console.log("Using in-memory MongoDB for local development");
  return uri;
}

// Connect the application to MongoDB
export const connectMongoDB = async () => {
  try {
    const uri = await resolveMongoUri();

    await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV === "development",
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
