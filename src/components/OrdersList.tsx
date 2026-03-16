import { useState } from 'react';
import { ServiceOrder, Client, OrderStatus, statusLabels, statusColors, paymentLabels, paymentIcons, CompanyInfo } from '../types';
import { formatCurrency, formatDate, calcTotal } from '../utils/format';
import { Search, Eye, Pencil, Trash2, Filter, SortAsc, ChevronRight } from 'lucide-react';
import OrderDetail from './OrderDetail';

interface OrdersListProps {
  orders: ServiceOrder[];
  getClient: (id: string) => Client | undefined;
  onEdit: (order: ServiceOrder) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: OrderStatus) => void;
  onUpdateOrder: (id: string, data: Partial<ServiceOrder>) => void;
  filterStatus?: OrderStatus;
  title: string;
  company: CompanyInfo;
}

type SortBy = 'number' | 'date' | 'value' | 'status';

export default function OrdersList({ orders, getClient, onEdit, onDelete, onChangeStatus, onUpdateOrder, title, company }: OrdersListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const filtered = orders
    .filter(o => {
      const q = search.toLowerCase();
      const client = getClient(o.clientId);
      return (
        o.title.toLowerCase().includes(q) ||
        o.number.toString().includes(q) ||
        (client?.name || '').toLowerCase().includes(q) ||
        o.equipment.toLowerCase().includes(q)
      );
    })
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'number') return b.number - a.number;
      if (sortBy === 'value') return calcTotal(b.items, b.discount) - calcTotal(a.items, a.discount);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  if (selectedOrder) {
    const freshOrder = orders.find(o => o.id === selectedOrder.id) || selectedOrder;
    return (
      <OrderDetail
        order={freshOrder}
        client={getClient(freshOrder.clientId)}
        company={company}
        onBack={() => setSelectedOrder(null)}
        onChangeStatus={(status) => onChangeStatus(freshOrder.id, status)}
        onEdit={() => { onEdit(freshOrder); setSelectedOrder(null); }}
        onUpdateOrder={(data) => onUpdateOrder(freshOrder.id, data)}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{filtered.length} de {orders.length} registros</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, nº, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full sm:w-auto pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <SortAsc size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="w-full sm:w-auto pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="date">Data</option>
              <option value="number">Número</option>
              <option value="value">Valor</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden space-y-3">
        {filtered.map(order => {
          const client = getClient(order.clientId);
          const total = calcTotal(order.items, order.discount);
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-800 text-sm">#{order.number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 text-sm truncate">{order.title}</p>
                  <p className="text-xs text-slate-500">{client?.name || 'N/A'}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 mt-1 shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    {paymentIcons[order.payment.method]}
                    {paymentLabels[order.payment.method]}
                  </span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{formatCurrency(total)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedOrder(order)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                  <Eye size={14} /> Detalhes
                </button>
                <button onClick={() => onEdit(order)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => { if (confirm('Excluir esta ordem?')) onDelete(order.id); }} className="py-2 px-3 text-xs text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">OS</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / Serviço</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Equipamento</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Pagamento</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(order => {
                const client = getClient(order.clientId);
                const total = calcTotal(order.items, order.discount);
                return (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800">#{order.number}</span>
                      <p className="text-[11px] text-slate-400">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-700 truncate max-w-[200px]">{order.title}</p>
                      <p className="text-xs text-slate-500">{client?.name || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-slate-600 text-xs">{order.equipment}</p>
                      <p className="text-slate-400 text-[11px]">{order.brand} {order.model}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[11px] px-3 py-1 rounded-full border font-semibold whitespace-nowrap ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                      <span className="text-xs text-slate-600 flex items-center justify-center gap-1">
                        <span>{paymentIcons[order.payment.method]}</span>
                        <span>{paymentLabels[order.payment.method]}</span>
                      </span>
                      {order.payment.paidAmount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold">✓ Pago</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-slate-800">{formatCurrency(total)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition" title="Ver detalhes">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => onEdit(order)} className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-500 hover:text-amber-600 transition" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Excluir esta ordem?')) onDelete(order.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600 transition"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg mb-1">Nenhuma ordem encontrada</p>
            <p className="text-sm">Tente outro filtro ou crie uma nova ordem de serviço.</p>
          </div>
        )}
      </div>

      {/* Mobile empty state */}
      {filtered.length === 0 && (
        <div className="md:hidden text-center py-12 text-slate-400">
          <p className="text-lg mb-1">Nenhuma ordem encontrada</p>
          <p className="text-sm">Tente outro filtro ou crie uma nova OS.</p>
        </div>
      )}
    </div>
  );
}
