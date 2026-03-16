import { fetchJson, isApiConfigured } from "../lib/api";
import { getAuthToken } from "../lib/session";
import { CompanyInfo, defaultCompany } from "../types";
import { StoreDriver, StoreSnapshot } from "../types/store";

const CLIENTS_KEY = "astra_clients_v3";
const ORDERS_KEY = "astra_orders_v3";
const COUNTER_KEY = "astra_counter_v3";
const COMPANY_KEY = "astra_company_v3";
const EXPENSES_KEY = "astra_expenses_v3";

function reviveDates<T>(value: T): T {
  return JSON.parse(JSON.stringify(value), (_key, current) => {
    if (typeof current === "string" && /^\d{4}-\d{2}-\d{2}T/.test(current)) {
      return new Date(current);
    }
    return current;
  });
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      return fallback;
    }
    return JSON.parse(data, (_key, current) => {
      if (typeof current === "string" && /^\d{4}-\d{2}-\d{2}T/.test(current)) {
        return new Date(current);
      }
      return current;
    });
  } catch {
    return fallback;
  }
}

function persistLocalSnapshot(snapshot: StoreSnapshot) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(snapshot.clients));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(snapshot.orders));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(snapshot.expenses));
  localStorage.setItem(COUNTER_KEY, JSON.stringify(snapshot.orderCounter));
  localStorage.setItem(COMPANY_KEY, JSON.stringify(snapshot.company));
}

export function loadLocalSnapshot(): StoreSnapshot {
  return {
    clients: loadFromStorage(CLIENTS_KEY, []),
    orders: loadFromStorage(ORDERS_KEY, []),
    expenses: loadFromStorage(EXPENSES_KEY, []),
    orderCounter: loadFromStorage(COUNTER_KEY, 1001),
    company: loadFromStorage<CompanyInfo>(COMPANY_KEY, defaultCompany),
  };
}

const localDriver: StoreDriver = {
  kind: "local",
  async load() {
    return loadLocalSnapshot();
  },
  async save(snapshot) {
    persistLocalSnapshot(snapshot);
  },
};

const apiDriver: StoreDriver = {
  kind: "api",
  async load() {
    const data = await fetchJson<StoreSnapshot>("/bootstrap");
    return {
      clients: reviveDates(data.clients),
      orders: reviveDates(data.orders),
      expenses: reviveDates(data.expenses),
      company: reviveDates(data.company ?? defaultCompany),
      orderCounter: data.orderCounter ?? 1001,
    };
  },
  async save(snapshot) {
    await fetchJson("/bootstrap/import", {
      method: "POST",
      body: JSON.stringify(snapshot),
    });
    persistLocalSnapshot(snapshot);
  },
};

export async function resolveDriver(): Promise<StoreDriver> {
  if (!isApiConfigured()) {
    return localDriver;
  }

  if (!getAuthToken()) {
    return localDriver;
  }

  try {
    await fetchJson("/health");
    return apiDriver;
  } catch {
    return localDriver;
  }
}
