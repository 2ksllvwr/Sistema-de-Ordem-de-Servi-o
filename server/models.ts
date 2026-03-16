import mongoose, { Schema } from "mongoose";

const serviceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    method: { type: String, required: true },
    installments: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    paidAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const clientSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    cpfCnpj: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const orderSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true, index: true },
    number: { type: Number, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    items: { type: [serviceItemSchema], default: [] },
    discount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    equipment: { type: String, default: "" },
    brand: { type: String, default: "" },
    model: { type: String, default: "" },
    serialNumber: { type: String, default: "" },
    defectReported: { type: String, default: "" },
    technician: { type: String, default: "" },
    warrantyDays: { type: Number, default: 90 },
    payment: { type: paymentSchema, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { versionKey: false }
);

const expenseSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const companySchema = new Schema(
  {
    ownerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    cnpj: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String },
  },
  { versionKey: false }
);

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const ClientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
export const CompanyModel = mongoose.models.Company || mongoose.model("Company", companySchema);
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
