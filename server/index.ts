import mongoose from "mongoose";
import { config } from "./config";
import { app } from "./app";

app.listen(config.port, () => {
  console.log(`API pronta em http://localhost:${config.port}`);
});

async function shutdown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
