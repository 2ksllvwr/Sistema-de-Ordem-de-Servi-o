import { Client, CompanyInfo, Expense, ServiceOrder } from "./index";

export interface StoreSnapshot {
  clients: Client[];
  orders: ServiceOrder[];
  expenses: Expense[];
  company: CompanyInfo;
  orderCounter: number;
}

export interface StoreDriver {
  kind: "local" | "api";
  load(): Promise<StoreSnapshot>;
  save(snapshot: StoreSnapshot): Promise<void>;
}
