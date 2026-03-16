import { LayoutDashboard, ClipboardList, Calculator, Users, Settings, PlusCircle, Menu, X, ChevronRight, Wallet } from 'lucide-react';

export type Page = 'dashboard' | 'orders' | 'budgets' | 'clients' | 'financeiro' | 'new-order' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  counts: { orders: number; budgets: number; clients: number };
  userName: string;
  onLogout: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode; section?: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'orders', label: 'Ordens de Servico', icon: <ClipboardList size={20} />, section: 'Gestao' },
  { page: 'budgets', label: 'Orcamentos', icon: <Calculator size={20} /> },
  { page: 'financeiro', label: 'Financeiro', icon: <Wallet size={20} />, section: 'Financas' },
  { page: 'clients', label: 'Clientes', icon: <Users size={20} />, section: 'Cadastros' },
  { page: 'settings', label: 'Configuracoes', icon: <Settings size={20} />, section: 'Sistema' },
];

const bottomNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { page: 'orders', label: 'Ordens', icon: <ClipboardList size={20} /> },
  { page: 'new-order', label: 'Nova OS', icon: <PlusCircle size={22} /> },
  { page: 'financeiro', label: 'Financeiro', icon: <Wallet size={20} /> },
  { page: 'clients', label: 'Clientes', icon: <Users size={20} /> },
];

function AstraLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 select-none"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6} fill="none">
        <path
          d="M50 10 L80 85 L65 85 L57 62 L43 62 L35 85 L20 85 Z M50 30 L40 55 L60 55 Z"
          fill="white"
          fillRule="evenodd"
        />
        <circle cx="50" cy="18" r="3" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
}

export { AstraLogo };

export default function Sidebar({ currentPage, onNavigate, mobileOpen, onToggleMobile, counts, userName, onLogout }: SidebarProps) {
  const getBadge = (page: Page) => {
    if (page === 'orders') return counts.orders;
    if (page === 'budgets') return counts.budgets;
    if (page === 'clients') return counts.clients;
    return null;
  };

  let lastSection = '';

  const handleNav = (page: Page) => {
    onNavigate(page);
    if (mobileOpen) onToggleMobile();
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <AstraLogo size={32} />
            <div>
              <h1 className="font-bold text-white text-sm leading-none tracking-tight">Astra Tech</h1>
              <p className="text-[9px] text-slate-400 font-medium">Gestao de Servicos</p>
            </div>
          </div>
          <button
            onClick={onToggleMobile}
            className="p-2 rounded-xl text-slate-300 hover:bg-slate-700/60 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onToggleMobile} />
      )}
      <div
        className={`lg:hidden fixed top-14 right-0 bottom-0 w-72 bg-slate-900 z-40 transform transition-transform duration-300 ease-out overflow-y-auto ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="p-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = currentPage === item.page;
            const badge = getBadge(item.page);
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            return (
              <div key={item.page}>
                {showSection && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-4 pt-5 pb-1.5">
                    {item.section}
                  </p>
                )}
                <button
                  onClick={() => handleNav(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge !== null && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-slate-600" />
                </button>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <p className="mb-3 text-xs text-slate-400">Conectado como {userName}</p>
          <button
            onClick={() => handleNav('new-order')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25"
          >
            <PlusCircle size={18} />
            Nova Ordem de Servico
          </button>
          <button
            onClick={onLogout}
            className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 safe-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map(item => {
            const isActive = currentPage === item.page;
            const isNewOrder = item.page === 'new-order';
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-xl transition-all ${
                  isNewOrder
                    ? 'text-white'
                    : isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isNewOrder ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 -mt-4">
                    {item.icon}
                  </div>
                ) : (
                  item.icon
                )}
                <span className={`text-[10px] font-semibold leading-tight ${isNewOrder ? 'mt-0.5' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white z-40 flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <AstraLogo size={44} />
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white">Astra Tech</h1>
              <p className="text-[11px] text-slate-400 font-medium">Gestao de Servicos</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {(() => { lastSection = ''; return null; })()}
          {navItems.map(item => {
            const isActive = currentPage === item.page;
            const badge = getBadge(item.page);
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            return (
              <div key={item.page}>
                {showSection && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-4 pt-5 pb-1.5">
                    {item.section}
                  </p>
                )}
                <button
                  onClick={() => onNavigate(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 shadow-sm border border-cyan-500/20'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : ''}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge !== null && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <p className="mb-3 text-xs text-slate-400">Conectado como {userName}</p>
          <button
            onClick={() => onNavigate('new-order')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
          >
            <PlusCircle size={18} />
            Nova Ordem
          </button>
          <button
            onClick={onLogout}
            className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/50 hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
