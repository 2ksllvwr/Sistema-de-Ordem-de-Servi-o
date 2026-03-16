import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { connectToDatabase } from "./db";
import { comparePassword, hashPassword, requireAuth, signToken, type AuthRequest } from "./auth";
import { ClientModel, CompanyModel, ExpenseModel, OrderModel, UserModel } from "./models";

export const app = express();

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res) => {
  const databaseReady = await connectToDatabase();

  res.json({
    ok: true,
    databaseReady,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const databaseReady = await connectToDatabase();

  if (!databaseReady) {
    res.status(503).json({
      message: "MongoDB ainda nao configurado.",
    });
    return;
  }

  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Nome, email e senha sao obrigatorios." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();

  if (existingUser) {
    res.status(409).json({ message: "Ja existe um usuario com este email." });
    return;
  }

  const userId = `u_${crypto.randomUUID()}`;
  const user = await UserModel.create({
    id: userId,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(String(password)),
    createdAt: new Date(),
  });

  await CompanyModel.create({
    ownerId: userId,
    name: "Minha Empresa",
    cnpj: "",
    phone: "",
    email: normalizedEmail,
    address: "",
  });

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  res.status(201).json({
    token: signToken(payload),
    user: payload,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const databaseReady = await connectToDatabase();

  if (!databaseReady) {
    res.status(503).json({
      message: "MongoDB ainda nao configurado.",
    });
    return;
  }

  const { email, password } = req.body ?? {};

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Email e senha sao obrigatorios." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user || !(await comparePassword(String(password), user.passwordHash))) {
    res.status(401).json({ message: "Email ou senha invalidos." });
    return;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  res.json({
    token: signToken(payload),
    user: payload,
  });
});

app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  res.json({
    user: req.auth,
  });
});

app.get("/api/bootstrap", requireAuth, async (req: AuthRequest, res) => {
  const ownerId = req.auth!.userId;
  const [clients, orders, expenses, company] = await Promise.all([
    ClientModel.find({ ownerId }).sort({ createdAt: -1 }).lean(),
    OrderModel.find({ ownerId }).sort({ createdAt: -1 }).lean(),
    ExpenseModel.find({ ownerId }).sort({ createdAt: -1 }).lean(),
    CompanyModel.findOne({ ownerId }).lean(),
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

app.post("/api/bootstrap/import", requireAuth, async (req: AuthRequest, res) => {
  const ownerId = req.auth!.userId;
  const { clients = [], orders = [], expenses = [], company = null } = req.body ?? {};

  await Promise.all([
    ClientModel.deleteMany({ ownerId }),
    OrderModel.deleteMany({ ownerId }),
    ExpenseModel.deleteMany({ ownerId }),
    CompanyModel.deleteMany({ ownerId }),
  ]);

  await Promise.all([
    clients.length ? ClientModel.insertMany(clients.map((item: Record<string, unknown>) => ({ ...item, ownerId }))) : Promise.resolve(),
    orders.length ? OrderModel.insertMany(orders.map((item: Record<string, unknown>) => ({ ...item, ownerId }))) : Promise.resolve(),
    expenses.length ? ExpenseModel.insertMany(expenses.map((item: Record<string, unknown>) => ({ ...item, ownerId }))) : Promise.resolve(),
    company ? CompanyModel.create({ ...company, ownerId }) : Promise.resolve(),
  ]);

  res.status(201).json({ ok: true });
});
