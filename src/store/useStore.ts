import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, ServiceOrder, OrderStatus, CompanyInfo, Expense, defaultCompany } from '../types';
import { StoreSnapshot } from '../types/store';
import { loadLocalSnapshot, resolveDriver } from './drivers';

function buildSnapshot(
  clients: Client[],
  orders: ServiceOrder[],
  expenses: Expense[],
  company: CompanyInfo,
  orderCounter: number
): StoreSnapshot {
  return {
    clients,
    orders,
    expenses,
    company,
    orderCounter,
  };
}

export function useStore() {
  const initial = loadLocalSnapshot();
  const [clients, setClients] = useState<Client[]>(initial.clients);
  const [orders, setOrders] = useState<ServiceOrder[]>(initial.orders);
  const [expenses, setExpenses] = useState<Expense[]>(initial.expenses);
  const [orderCounter, setOrderCounter] = useState<number>(initial.orderCounter);
  const [company, setCompanyState] = useState<CompanyInfo>(initial.company ?? defaultCompany);
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<'local' | 'api'>('local');
  const [error, setError] = useState<string | null>(null);
  const driverRef = useRef<Awaited<ReturnType<typeof resolveDriver>> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const driver = await resolveDriver();
        const snapshot = await driver.load();
        if (!mounted) {
          return;
        }
        driverRef.current = driver;
        setClients(snapshot.clients);
        setOrders(snapshot.orders);
        setExpenses(snapshot.expenses);
        setOrderCounter(snapshot.orderCounter);
        setCompanyState(snapshot.company ?? defaultCompany);
        setStorageMode(driver.kind);
        setError(null);
      } catch (currentError) {
        if (!mounted) {
          return;
        }
        setError(currentError instanceof Error ? currentError.message : 'Nao foi possivel carregar os dados.');
      } finally {
        if (mounted) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current || !driverRef.current) {
      return;
    }

    const snapshot = buildSnapshot(clients, orders, expenses, company, orderCounter);

    driverRef.current.save(snapshot).catch(currentError => {
      setError(currentError instanceof Error ? currentError.message : 'Nao foi possivel salvar os dados.');
    });
  }, [clients, orders, expenses, company, orderCounter]);

  // --- Clients ---
  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = { ...client, id: `c_${Date.now()}`, createdAt: new Date() };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- Orders ---
  const addOrder = useCallback((order: Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: ServiceOrder = {
      ...order,
      id: `o_${Date.now()}`,
      number: orderCounter,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrders(prev => [...prev, newOrder]);
    setOrderCounter(prev => prev + 1);
    return newOrder;
  }, [orderCounter]);

  const updateOrder = useCallback((id: string, data: Partial<ServiceOrder>) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              ...data,
              updatedAt: new Date(),
              finishedAt: data.status === 'finalizado' ? new Date() : o.finishedAt,
            }
          : o
      )
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const changeStatus = useCallback((id: string, status: OrderStatus) => {
    updateOrder(id, { status });
  }, [updateOrder]);

  // --- Expenses ---
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, data: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // --- Company ---
  const setCompany = useCallback((data: CompanyInfo) => {
    setCompanyState(data);
  }, []);

  return {
    clients, orders, expenses, company,
    loading, storageMode, error,
    getClient, addClient, updateClient, deleteClient,
    addOrder, updateOrder, deleteOrder, changeStatus,
    addExpense, updateExpense, deleteExpense,
    setCompany,
  };
}
