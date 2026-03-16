import { useCallback, useEffect, useState } from 'react';
import Sidebar, { Page } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';
import ClientsList from './components/ClientsList';
import CompanySettings from './components/CompanySettings';
import Financeiro from './components/Financeiro';
import AuthScreen from './components/AuthScreen';
import { useStore } from './store/useStore';
import { ServiceOrder } from './types';
import { fetchJson } from './lib/api';
import { clearAuthToken, getAuthToken, type AuthUser } from './lib/session';

interface MeResponse {
  user: AuthUser;
}

function AuthenticatedApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const store = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  if (store.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-md w-full text-center">
          <h1 className="text-lg font-bold text-slate-800">Carregando sistema</h1>
          <p className="text-sm text-slate-500 mt-2">
            Preparando os dados {store.storageMode === 'api' ? 'da API' : 'locais'} para voce.
          </p>
        </div>
      </div>
    );
  }

  const activeOrders = store.orders.filter(o => o.status !== 'orcamento' && o.status !== 'cancelado');
  const budgets = store.orders.filter(o => o.status === 'orcamento');

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as Page);
    setEditingOrder(null);
    setMobileOpen(false);
  }, []);

  const handleEditOrder = useCallback((order: ServiceOrder) => {
    setEditingOrder(order);
    setCurrentPage('new-order');
  }, []);

  const handleSaveOrder = useCallback((data: Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    store.addOrder(data);
    setCurrentPage('orders');
    setEditingOrder(null);
  }, [store]);

  const handleUpdateOrder = useCallback((id: string, data: Partial<ServiceOrder>) => {
    store.updateOrder(id, data);
    setCurrentPage('orders');
    setEditingOrder(null);
  }, [store]);

  const handleMigrateLocalData = useCallback(async () => {
    const migrated = await store.migrateLocalDataToApi();
    if (migrated) {
      window.alert('Dados locais enviados para o MongoDB com sucesso.');
    }
  }, [store]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            orders={store.orders}
            clients={store.clients}
            getClient={store.getClient}
            onNavigate={handleNavigate}
          />
        );

      case 'orders':
        return (
          <OrdersList
            orders={activeOrders}
            getClient={store.getClient}
            onEdit={handleEditOrder}
            onDelete={store.deleteOrder}
            onChangeStatus={store.changeStatus}
            onUpdateOrder={store.updateOrder}
            title="Ordens de Servico"
            company={store.company}
          />
        );

      case 'budgets':
        return (
          <OrdersList
            orders={budgets}
            getClient={store.getClient}
            onEdit={handleEditOrder}
            onDelete={store.deleteOrder}
            onChangeStatus={store.changeStatus}
            onUpdateOrder={store.updateOrder}
            filterStatus="orcamento"
            title="Orcamentos"
            company={store.company}
          />
        );

      case 'financeiro':
        return (
          <Financeiro
            orders={store.orders}
            expenses={store.expenses}
            onAddExpense={store.addExpense}
            onDeleteExpense={store.deleteExpense}
          />
        );

      case 'clients':
        return (
          <ClientsList
            clients={store.clients}
            orders={store.orders}
            onAdd={store.addClient}
            onUpdate={store.updateClient}
            onDelete={store.deleteClient}
          />
        );

      case 'settings':
        return (
          <CompanySettings
            company={store.company}
            onSave={store.setCompany}
          />
        );

      case 'new-order':
        return (
          <OrderForm
            clients={store.clients}
            editingOrder={editingOrder}
            onSave={handleSaveOrder}
            onUpdate={handleUpdateOrder}
            onCancel={() => {
              setEditingOrder(null);
              setCurrentPage('orders');
            }}
            onAddClient={() => {
              setCurrentPage('clients');
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        userName={user.name}
        onLogout={onLogout}
        counts={{
          orders: activeOrders.length,
          budgets: budgets.length,
          clients: store.clients.length,
        }}
      />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pt-[72px] pb-24 lg:pt-6 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {store.storageMode === 'local' && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Banco remoto ainda nao conectado. O sistema esta funcionando com armazenamento local.
              </div>
            )}
            {store.storageMode === 'api' && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">MongoDB Atlas conectado.</p>
                  <p className="text-emerald-700">
                    Novas alteracoes serao salvas no banco remoto.
                  </p>
                </div>
                {store.hasLocalBackup && (
                  <button
                    onClick={handleMigrateLocalData}
                    disabled={store.isMigrating}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {store.isMigrating ? 'Migrando...' : 'Migrar dados locais'}
                  </button>
                )}
              </div>
            )}
            {store.error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {store.error}
              </div>
            )}
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setLoadingSession(false);
      return;
    }

    fetchJson<MeResponse>('/auth/me')
      .then(response => {
        setUser(response.user);
      })
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => {
        setLoadingSession(false);
      });
  }, []);

  const handleAuthenticated = useCallback((currentUser: AuthUser) => {
    setUser(currentUser);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        Carregando sessao...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}
