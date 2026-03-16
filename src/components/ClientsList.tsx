import { useState } from 'react';
import { Client, ServiceOrder } from '../types';
import { formatDate } from '../utils/format';
import { Search, UserPlus, Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import ClientForm from './ClientForm';

interface ClientsListProps {
  clients: Client[];
  orders: ServiceOrder[];
  onAdd: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Client>) => void;
  onDelete: (id: string) => void;
}

export default function ClientsList({ clients, orders, onAdd, onUpdate, onDelete }: ClientsListProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getOrderCount = (clientId: string) => orders.filter(o => o.clientId === clientId).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-xs sm:text-sm text-slate-500">{clients.length} clientes cadastrados</p>
        </div>
        <button
          onClick={() => { setEditingClient(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-500/25"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF/CNPJ ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 sm:pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(client => (
          <div key={client.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{client.name}</h3>
                  <p className="text-xs text-slate-500">{client.cpfCnpj || 'Sem CPF/CNPJ'}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                <button onClick={() => { setEditingClient(client); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => { if (confirm('Excluir este cliente?')) onDelete(client.id); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              {client.phone && (
                <div className="flex items-center gap-2"><Phone size={13} className="shrink-0" /><span className="truncate">{client.phone}</span></div>
              )}
              {client.email && (
                <div className="flex items-center gap-2"><Mail size={13} className="shrink-0" /><span className="truncate">{client.email}</span></div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-center gap-2"><MapPin size={13} className="shrink-0" /><span className="truncate">{client.address}{client.city ? `, ${client.city}/${client.state}` : ''}</span></div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Desde {formatDate(client.createdAt)}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {getOrderCount(client.id)} OS
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <p className="text-base sm:text-lg mb-1">Nenhum cliente encontrado</p>
            <p className="text-xs sm:text-sm">Tente outro termo de busca ou cadastre um novo cliente.</p>
          </div>
        )}
      </div>

      {showForm && (
        <ClientForm
          editingClient={editingClient}
          onSave={onAdd}
          onUpdate={onUpdate}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
        />
      )}
    </div>
  );
}
