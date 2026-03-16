import { ServiceOrder, Client, statusLabels, statusColors, paymentLabels } from '../types';
import { formatCurrency, formatDate, calcTotal } from '../utils/format';
import { TrendingUp, DollarSign, Clock, CheckCircle2, FileText, Users, ArrowRight, Wallet, Inbox } from 'lucide-react';

interface DashboardProps {
  orders: ServiceOrder[];
  clients: Client[];
  getClient: (id: string) => Client | undefined;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ orders, clients, getClient, onNavigate }: DashboardProps) {
  const totalRevenue = orders
    .filter(o => o.status === 'finalizado')
    .reduce((sum, o) => sum + calcTotal(o.items, o.discount), 0);

  const pendingRevenue = orders
    .filter(o => o.status !== 'finalizado' && o.status !== 'cancelado' && o.status !== 'orcamento')
    .reduce((sum, o) => sum + calcTotal(o.items, o.discount), 0);

  const openCount = orders.filter(o => o.status === 'aberto').length;
  const inProgressCount = orders.filter(o => o.status === 'em_andamento').length;
  const doneCount = orders.filter(o => o.status === 'finalizado').length;
  const budgetCount = orders.filter(o => o.status === 'orcamento').length;

  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 6);

  const paidOrders = orders.filter(o => o.payment.paidAmount > 0);
  const paymentMethodStats: Record<string, number> = {};
  paidOrders.forEach(o => {
    const label = paymentLabels[o.payment.method] || o.payment.method;
    paymentMethodStats[label] = (paymentMethodStats[label] || 0) + o.payment.paidAmount;
  });

  const cards = [
    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: <TrendingUp size={20} />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
    { label: 'Valor Pendente', value: formatCurrency(pendingRevenue), icon: <DollarSign size={20} />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
    { label: 'Em Andamento', value: `${inProgressCount + openCount}`, icon: <Clock size={20} />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
    { label: 'Finalizados', value: `${doneCount}`, icon: <CheckCircle2 size={20} />, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
  ];

  const isEmpty = orders.length === 0 && clients.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Visão geral — Astra Tech</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Users size={14} />
          <span>{clients.length} clientes</span>
          <span className="text-slate-300">|</span>
          <FileText size={14} />
          <span>{orders.length} ordens</span>
        </div>
      </div>

      {/* Welcome banner when empty */}
      {isEmpty && (
        <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Inbox size={28} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">Bem-vindo ao Astra Tech! 🚀</h2>
              <p className="text-sm text-white/80 mb-4">
                Seu sistema está pronto para uso. Comece cadastrando seus clientes e criando ordens de serviço.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onNavigate('clients')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  <Users size={16} /> Cadastrar Cliente
                </button>
                <button
                  onClick={() => onNavigate('new-order')}
                  className="flex items-center gap-2 bg-white text-blue-600 hover:bg-white/90 px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  <FileText size={16} /> Criar Primeira OS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 sm:p-5 text-white shadow-lg ${card.shadow}`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl">{card.icon}</div>
            </div>
            <p className="text-lg sm:text-2xl font-black leading-tight">{card.value}</p>
            <p className="text-[11px] sm:text-sm text-white/80 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Status Overview */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            📊 Resumo por Status
          </h3>
          <div className="space-y-3">
            {([
              { status: 'orcamento' as const, count: budgetCount },
              { status: 'aberto' as const, count: openCount },
              { status: 'em_andamento' as const, count: inProgressCount },
              { status: 'finalizado' as const, count: doneCount },
            ]).map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full border font-semibold ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
                <div className="flex items-center gap-2 flex-1 mx-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'finalizado' ? 'bg-emerald-500' :
                        status === 'em_andamento' ? 'bg-amber-500' :
                        status === 'aberto' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${orders.length > 0 ? (count / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-700 w-6 sm:w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <DollarSign size={16} className="text-slate-400" />
            Pagamentos Recebidos
          </h3>
          {Object.keys(paymentMethodStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(paymentMethodStats)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">{method}</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total Recebido</span>
                <span className="text-sm sm:text-base font-black text-emerald-600">
                  {formatCurrency(Object.values(paymentMethodStats).reduce((a, b) => a + b, 0))}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">Nenhum pagamento registrado</p>
              <p className="text-xs text-slate-300 mt-1">Finalize ordens para ver os dados</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 text-sm">⚡ Ações Rápidas</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('new-order')}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition text-xs sm:text-sm font-medium"
            >
              <FileText size={18} />
              <span className="flex-1 text-left">Nova Ordem de Serviço</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('clients')}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl transition text-xs sm:text-sm font-medium"
            >
              <Users size={18} />
              <span className="flex-1 text-left">Cadastrar Cliente</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('financeiro')}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition text-xs sm:text-sm font-medium"
            >
              <Wallet size={18} />
              <span className="flex-1 text-left">Painel Financeiro</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('budgets')}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition text-xs sm:text-sm font-medium"
            >
              <Clock size={18} />
              <span className="flex-1 text-left">Orçamentos Pendentes</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm">📋 Atividade Recente</h3>
          {orders.length > 0 && (
            <button onClick={() => onNavigate('orders')} className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </button>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {recentOrders.map(order => {
              const client = getClient(order.clientId);
              const total = calcTotal(order.items, order.discount);
              return (
                <div key={order.id} className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/50 transition">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0">
                    {order.status === 'finalizado' ? '✅' : order.status === 'em_andamento' ? '⚙️' : order.status === 'orcamento' ? '📋' : '📂'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                      OS #{order.number} — {order.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500">{client?.name || 'N/A'} • {formatDate(order.updatedAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{formatCurrency(total)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-slate-400 text-sm">Nenhuma atividade ainda</p>
            <p className="text-slate-300 text-xs mt-1">Crie uma ordem de serviço para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
