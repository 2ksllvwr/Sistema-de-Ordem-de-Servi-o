import { useState } from 'react';
import { Client } from '../types';
import { X, Save } from 'lucide-react';

interface ClientFormProps {
  editingClient?: Client | null;
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdate?: (id: string, data: Partial<Client>) => void;
  onClose: () => void;
}

export default function ClientForm({ editingClient, onSave, onUpdate, onClose }: ClientFormProps) {
  const [form, setForm] = useState({
    name: editingClient?.name || '',
    email: editingClient?.email || '',
    phone: editingClient?.phone || '',
    cpfCnpj: editingClient?.cpfCnpj || '',
    address: editingClient?.address || '',
    city: editingClient?.city || '',
    state: editingClient?.state || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingClient && onUpdate) {
      onUpdate(editingClient.id, form);
    } else {
      onSave(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:mx-4 rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up sm:animate-fade-in">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo / Razão Social *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: João Silva"
              className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">CPF / CNPJ</label>
              <input type="text" value={form.cpfCnpj} onChange={e => setForm(p => ({ ...p, cpfCnpj: e.target.value }))}
                placeholder="000.000.000-00"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
              <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="(11) 99999-0000"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@exemplo.com"
              className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Endereço</label>
            <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Rua, número - Bairro"
              className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                placeholder="São Paulo"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
              <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                placeholder="SP"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition text-center">
              Cancelar
            </button>
            <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-500/25">
              <Save size={16} />
              {editingClient ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
