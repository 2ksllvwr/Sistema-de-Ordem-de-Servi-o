import mongoose from "mongoose";
import { config } from "./config";

let hasLoggedMissingUri = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  if (!config.mongodbUri) {
    if (!hasLoggedMissingUri) {
      console.warn("MongoDB URI nao configurada. A API iniciara sem conexao com o banco.");
      hasLoggedMissingUri = true;
    }
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    console.error("Falha ao conectar no MongoDB:", error);
    return false;
  }

  return true;
}
