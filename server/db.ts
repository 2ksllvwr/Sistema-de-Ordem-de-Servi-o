import mongoose from "mongoose";
import { config } from "./config";

let hasLoggedMissingUri = false;

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

  await mongoose.connect(config.mongodbUri, {
    dbName: "ordem-servico",
  });

  return true;
}
