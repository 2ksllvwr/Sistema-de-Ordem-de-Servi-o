import { useState, useMemo } from 'react';
import {
  ServiceOrder,
  Expense,
  ExpenseCategory,
  expenseCategoryLabels,
  expenseCategoryIcons,
  paymentLabels,
} from '../types';
import { formatCurrency, formatDate, calcTotal } from '../utils/format';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FinanceiroProps {
  orders: ServiceOrder[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CHART_COLORS = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
  '#84cc16', '#a855f7',
];

function DonutChart({
  data,
  size = 200,
  strokeWidth = 32,
  label,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  label?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
          />
          <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="fill-slate-400 text-sm font-medium">
            Sem dados
          </text>
        </svg>
        {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const offset = cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-700"
            />
          );
        })}
        {centerValue && (
          <>
            <text x="50%" y="46%" textAnchor="middle" className="fill-slate-700 text-sm font-bold" style={{ fontSize: size > 160 ? 14 : 11 }}>
              {centerValue}
            </text>
            <text x="50%" y="56%" textAnchor="middle" className="fill-slate-400" style={{ fontSize: size > 160 ? 10 : 8 }}>
              Total
            </text>
          </>
        )}
      </svg>
      {label && <p className="text-xs text-slate-500 font-semibold">{label}</p>}
    </div>
  );
}

function ComparisonBar({ current, previous, label, color }: { current: number; previous: number; label: string; color: string }) {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  const maxVal = Math.max(current, previous, 1);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <div className="flex items-center gap-1">
          {diff !== 0 && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {diff > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(diff).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 w-12">Atual</span>
          <div className="flex-1 bg-slate-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${color}`} style={{ width: `${(current / maxVal) * 100}%`, transition: 'width 0.7s' }} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 w-24 text-right">{formatCurrency(current)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 w-12">Anterior</span>
          <div className="flex-1 bg-slate-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-slate-300" style={{ width: `${(previous / maxVal) * 100}%`, transition: 'width 0.7s' }} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 w-24 text-right">{formatCurrency(previous)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Financeiro({ orders, expenses, onAddExpense, onDeleteExpense }: FinanceiroProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'ganhos' | 'despesas'>('resumo');

  // Expense form state
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('pecas');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;

  const stats = useMemo(() => {
    // Current month
    const currentFinished = orders.filter(o => {
      if (o.status !== 'finalizado' || !o.finishedAt) return false;
      const d = new Date(o.finishedAt);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
    const currentPaid = orders.filter(o => {
      if (!o.payment.paidAt) return false;
      const d = new Date(o.payment.paidAt);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
    const currentExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    // Previous month
    const prevFinished = orders.filter(o => {
      if (o.status !== 'finalizado' || !o.finishedAt) return false;
      const d = new Date(o.finishedAt);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    const prevPaid = orders.filter(o => {
      if (!o.payment.paidAt) return false;
      const d = new Date(o.payment.paidAt);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    const prevExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const currentRevenue = currentFinished.reduce((s, o) => s + calcTotal(o.items, o.discount), 0);
    const currentReceived = currentPaid.reduce((s, o) => s + o.payment.paidAmount, 0);
    const currentExpTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const currentProfit = currentRevenue - currentExpTotal;

    const prevRevenue = prevFinished.reduce((s, o) => s + calcTotal(o.items, o.discount), 0);
    const prevReceived = prevPaid.reduce((s, o) => s + o.payment.paidAmount, 0);
    const prevExpTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
    const prevProfit = prevRevenue - prevExpTotal;

    // Revenue by payment method
    const revenueByMethod: Record<string, number> = {};
    currentPaid.forEach(o => {
      const lbl = paymentLabels[o.payment.method] || o.payment.method;
      revenueByMethod[lbl] = (revenueByMethod[lbl] || 0) + o.payment.paidAmount;
    });

    // Expenses by category
    const expByCategory: Record<string, number> = {};
    currentExpenses.forEach(e => {
      const lbl = expenseCategoryLabels[e.category] || e.category;
      expByCategory[lbl] = (expByCategory[lbl] || 0) + e.amount;
    });

    // Previous expenses by category (for comparison)
    const prevExpByCategory: Record<string, number> = {};
    prevExpenses.forEach(e => {
      const lbl = expenseCategoryLabels[e.category] || e.category;
      prevExpByCategory[lbl] = (prevExpByCategory[lbl] || 0) + e.amount;
    });

    return {
      currentRevenue, currentReceived, currentExpTotal, currentProfit,
      prevRevenue, prevReceived, prevExpTotal, prevProfit,
      revenueByMethod, expByCategory, prevExpByCategory,
      currentFinished, currentExpenses, currentPaid,
      servicesCount: currentFinished.length,
      prevServicesCount: prevFinished.length,
    };
  }, [orders, expenses, viewMonth, viewYear, prevMonth, prevYear]);

  const revenueChartData = Object.entries(stats.revenueByMethod).map(([label, value], i) => ({
    label, value, color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const expenseChartData = Object.entries(stats.expByCategory).map(([label, value], i) => ({
    label, value, color: CHART_COLORS[(i + 4) % CHART_COLORS.length],
  }));

  const profitVsExpenseData = [
    { label: 'Lucro', value: Math.max(stats.currentProfit, 0), color: '#10b981' },
    { label: 'Despesas', value: stats.currentExpTotal, color: '#ef4444' },
  ];

  const handleAddExpense = () => {
    if (!expDesc.trim() || !expAmount) return;
    onAddExpense({
      description: expDesc.trim(),
      category: expCategory,
      amount: parseFloat(expAmount),
      date: new Date(expDate + 'T12:00:00'),
      notes: expNotes.trim(),
    });
    setExpDesc('');
    setExpAmount('');
    setExpNotes('');
    setShowExpenseForm(false);
  };

  const goMonth = (dir: number) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  const kpiCards = [
    {
      label: 'Receita',
      value: stats.currentRevenue,
      prev: stats.prevRevenue,
      icon: <TrendingUp size={18} />,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Despesas',
      value: stats.currentExpTotal,
      prev: stats.prevExpTotal,
      icon: <TrendingDown size={18} />,
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/20',
    },
    {
      label: 'Lucro Líquido',
      value: stats.currentProfit,
      prev: stats.prevProfit,
      icon: <DollarSign size={18} />,
      gradient: stats.currentProfit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600',
      shadow: stats.currentProfit >= 0 ? 'shadow-blue-500/20' : 'shadow-orange-500/20',
    },
    {
      label: 'Recebido',
      value: stats.currentReceived,
      prev: stats.prevReceived,
      icon: <BarChart3 size={18} />,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart size={24} className="text-blue-500" />
            Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Gestão financeira completa</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => goMonth(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"><ChevronLeft size={18} /></button>
          <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-xl">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-700">{MONTHS[viewMonth]} {viewYear}</span>
          </div>
          <button
            onClick={() => goMonth(1)}
            disabled={viewMonth === now.getMonth() && viewYear === now.getFullYear()}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, i) => {
          const diff = card.prev > 0 ? ((card.value - card.prev) / card.prev) * 100 : card.value > 0 ? 100 : 0;
          return (
            <div key={i} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg ${card.shadow}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">{card.icon}</div>
                {diff !== 0 && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                    {diff > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(diff).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-xl font-black leading-tight">{formatCurrency(card.value)}</p>
              <p className="text-[10px] sm:text-xs text-white/80 font-medium mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['resumo', 'ganhos', 'despesas'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'resumo' ? '📊 Resumo' : tab === 'ganhos' ? '💰 Ganhos' : '💸 Despesas'}
          </button>
        ))}
      </div>

      {/* ===== RESUMO TAB ===== */}
      {activeTab === 'resumo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut: Lucro vs Despesas */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
              <PieChart size={16} className="text-blue-500" />
              Lucro vs Despesas — {MONTHS[viewMonth]}
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <DonutChart
                data={profitVsExpenseData}
                size={180}
                strokeWidth={36}
                centerValue={formatCurrency(stats.currentRevenue)}
              />
              <div className="space-y-3 flex-1">
                {profitVsExpenseData.map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-slate-600 flex-1">{d.label}</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(d.value)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex-1">Margem de Lucro</span>
                    <span className={`text-sm font-black ${stats.currentProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stats.currentRevenue > 0 ? ((stats.currentProfit / stats.currentRevenue) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison bars */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" />
              Comparativo: {MONTHS[viewMonth]} vs {MONTHS[prevMonth]}
            </h3>
            <div className="space-y-5">
              <ComparisonBar current={stats.currentRevenue} previous={stats.prevRevenue} label="Receita" color="bg-emerald-500" />
              <ComparisonBar current={stats.currentExpTotal} previous={stats.prevExpTotal} label="Despesas" color="bg-red-500" />
              <ComparisonBar current={Math.max(stats.currentProfit, 0)} previous={Math.max(stats.prevProfit, 0)} label="Lucro" color="bg-blue-500" />
              <ComparisonBar current={stats.currentReceived} previous={stats.prevReceived} label="Recebido" color="bg-violet-500" />
            </div>
          </div>

          {/* Services count */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">📋 Serviços Finalizados</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-800">{stats.servicesCount}</p>
                <p className="text-xs text-slate-500 mt-1">{MONTHS[viewMonth]}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-400">{stats.prevServicesCount}</p>
                <p className="text-xs text-slate-400 mt-1">{MONTHS[prevMonth]}</p>
              </div>
              {stats.prevServicesCount > 0 && (
                <div className={`text-sm font-bold flex items-center gap-1 ${
                  stats.servicesCount >= stats.prevServicesCount ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stats.servicesCount >= stats.prevServicesCount ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(((stats.servicesCount - stats.prevServicesCount) / stats.prevServicesCount) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>

          {/* Ticket medio */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">🎯 Ticket Médio</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800">
                  {stats.servicesCount > 0 ? formatCurrency(stats.currentRevenue / stats.servicesCount) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Mês atual</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-400">
                  {stats.prevServicesCount > 0 ? formatCurrency(stats.prevRevenue / stats.prevServicesCount) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Mês anterior</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== GANHOS TAB ===== */}
      {activeTab === 'ganhos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut: Revenue by method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
              <PieChart size={16} className="text-emerald-500" />
              Recebimentos por Forma de Pagamento
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <DonutChart
                data={revenueChartData}
                size={180}
                strokeWidth={34}
                centerValue={formatCurrency(stats.currentReceived)}
              />
              <div className="space-y-2 flex-1 w-full">
                {revenueChartData.length > 0 ? revenueChartData.map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-slate-600 flex-1 truncate">{d.label}</span>
                    <span className="text-xs font-bold text-slate-700">{formatCurrency(d.value)}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhum recebimento no período</p>
                )}
              </div>
            </div>
          </div>

          {/* List of paid orders */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">💰 Pagamentos Recebidos em {MONTHS[viewMonth]}</h3>
            {stats.currentPaid.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {stats.currentPaid.map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">💵</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">OS #{o.number} — {o.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {paymentLabels[o.payment.method]} • {o.payment.paidAt ? formatDate(o.payment.paidAt) : '-'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 shrink-0">{formatCurrency(o.payment.paidAmount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">Nenhum pagamento registrado neste mês</p>
              </div>
            )}
          </div>

          {/* Revenue comparison */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              Comparativo de Receita
            </h3>
            <ComparisonBar current={stats.currentRevenue} previous={stats.prevRevenue} label="Receita Total" color="bg-emerald-500" />
            <div className="mt-4">
              <ComparisonBar current={stats.currentReceived} previous={stats.prevReceived} label="Total Recebido" color="bg-cyan-500" />
            </div>
          </div>
        </div>
      )}

      {/* ===== DESPESAS TAB ===== */}
      {activeTab === 'despesas' && (
        <div className="space-y-4">
          {/* Add expense button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white py-2.5 px-5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
            >
              <PlusCircle size={16} />
              Nova Despesa
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Donut: Expenses by category */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                <PieChart size={16} className="text-red-500" />
                Despesas por Categoria
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <DonutChart
                  data={expenseChartData}
                  size={180}
                  strokeWidth={34}
                  centerValue={formatCurrency(stats.currentExpTotal)}
                />
                <div className="space-y-2 flex-1 w-full">
                  {expenseChartData.length > 0 ? expenseChartData.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600 flex-1 truncate">{d.label}</span>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(d.value)}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 text-center py-4">Nenhuma despesa no período</p>
                  )}
                </div>
              </div>
            </div>

            {/* Expense comparison */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                <BarChart3 size={16} className="text-red-500" />
                Comparativo: {MONTHS[viewMonth]} vs {MONTHS[prevMonth]}
              </h3>
              <div className="space-y-4">
                <ComparisonBar current={stats.currentExpTotal} previous={stats.prevExpTotal} label="Total de Despesas" color="bg-red-500" />
                {Object.entries(stats.expByCategory).map(([cat, val]) => (
                  <ComparisonBar
                    key={cat}
                    current={val}
                    previous={stats.prevExpByCategory[cat] || 0}
                    label={cat}
                    color="bg-rose-400"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Expense list */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">📋 Despesas de {MONTHS[viewMonth]}</h3>
            {stats.currentExpenses.length > 0 ? (
              <div className="space-y-2">
                {[...stats.currentExpenses]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(exp => (
                    <div key={exp.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-red-50/50 transition group">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-base shrink-0">
                        {expenseCategoryIcons[exp.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{exp.description}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">
                          {expenseCategoryLabels[exp.category]} • {formatDate(exp.date)}
                        </p>
                        {exp.notes && <p className="text-[10px] text-slate-400 truncate">{exp.notes}</p>}
                      </div>
                      <span className="text-sm font-bold text-red-600 shrink-0">{formatCurrency(exp.amount)}</span>
                      <button
                        onClick={() => {
                          if (confirm('Excluir esta despesa?')) onDeleteExpense(exp.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-400 text-sm">Nenhuma despesa registrada neste mês</p>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="mt-3 text-sm text-red-600 font-semibold hover:underline"
                >
                  + Adicionar despesa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== EXPENSE FORM MODAL ===== */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowExpenseForm(false)}>
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Nova Despesa</h3>
              <button onClick={() => setShowExpenseForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="Ex: Tela LCD iPhone 13..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                  >
                    {Object.entries(expenseCategoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {expenseCategoryIcons[key as ExpenseCategory]} {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={e => setExpDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observações</label>
                <textarea
                  value={expNotes}
                  onChange={e => setExpNotes(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={!expDesc.trim() || !expAmount}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold text-sm hover:from-red-400 hover:to-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                >
                  Salvar Despesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
