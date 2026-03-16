import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config";
import { connectToDatabase } from "./db";
import { ClientModel, CompanyModel, ExpenseModel, OrderModel } from "./models";

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res) => {
  const databaseReady = await connectToDatabase();

  res.json({
    ok: true,
    databaseReady,
    mongoConfigured: Boolean(config.mongodbUri),
  });
});

app.get("/api/bootstrap", async (_req, res) => {
  const databaseReady = await connectToDatabase();

  if (!databaseReady) {
    res.status(503).json({
      message: "MongoDB ainda nao configurado.",
    });
    return;
  }

  const [clients, orders, expenses, company] = await Promise.all([
    ClientModel.find().sort({ createdAt: -1 }).lean(),
    OrderModel.find().sort({ createdAt: -1 }).lean(),
    ExpenseModel.find().sort({ createdAt: -1 }).lean(),
    CompanyModel.findOne().lean(),
  ]);

  const counter = orders.reduce((max, order) => Math.max(max, Number(order.number) || 1000), 1000) + 1;

  res.json({
    clients,
    orders,
    expenses,
    company,
    orderCounter: counter,
  });
});

app.post("/api/bootstrap/import", async (req, res) => {
  const databaseReady = await connectToDatabase();

  if (!databaseReady) {
    res.status(503).json({
      message: "MongoDB ainda nao configurado.",
    });
    return;
  }

  const { clients = [], orders = [], expenses = [], company = null } = req.body ?? {};

  await Promise.all([
    ClientModel.deleteMany({}),
    OrderModel.deleteMany({}),
    ExpenseModel.deleteMany({}),
    CompanyModel.deleteMany({}),
  ]);

  await Promise.all([
    clients.length ? ClientModel.insertMany(clients) : Promise.resolve(),
    orders.length ? OrderModel.insertMany(orders) : Promise.resolve(),
    expenses.length ? ExpenseModel.insertMany(expenses) : Promise.resolve(),
    company ? CompanyModel.create(company) : Promise.resolve(),
  ]);

  res.status(201).json({ ok: true });
});

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
