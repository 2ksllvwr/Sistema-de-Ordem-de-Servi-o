import { useState } from 'react';
import { ServiceOrder, ServiceItem, Client, OrderStatus, PaymentMethod, paymentLabels } from '../types';
import { generateId } from '../utils/format';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

interface OrderFormProps {
  clients: Client[];
  editingOrder: ServiceOrder | null;
  onSave: (data: Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, data: Partial<ServiceOrder>) => void;
  onCancel: () => void;
  onAddClient: () => void;
}

export default function OrderForm({ clients, editingOrder, onSave, onUpdate, onCancel, onAddClient }: OrderFormProps) {
  const [form, setForm] = useState({
    clientId: editingOrder?.clientId || '',
    status: (editingOrder?.status || 'aberto') as OrderStatus,
    title: editingOrder?.title || '',
    description: editingOrder?.description || '',
    equipment: editingOrder?.equipment || '',
    brand: editingOrder?.brand || '',
    model: editingOrder?.model || '',
    serialNumber: editingOrder?.serialNumber || '',
    defectReported: editingOrder?.defectReported || '',
    technician: editingOrder?.technician || '',
    warrantyDays: editingOrder?.warrantyDays ?? 90,
    discount: editingOrder?.discount || 0,
    notes: editingOrder?.notes || '',
    paymentMethod: (editingOrder?.payment?.method || 'pendente') as PaymentMethod,
    paymentInstallments: editingOrder?.payment?.installments || 1,
    paymentNotes: editingOrder?.payment?.notes || '',
    paymentPaidAmount: editingOrder?.payment?.paidAmount || 0,
  });

  const [items, setItems] = useState<ServiceItem[]>(
    editingOrder?.items?.length ? editingOrder.items : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }]
  );

  const set = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  const addItem = () => setItems(prev => [...prev, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = subtotal - form.discount;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.clientId || !form.title.trim()) return;

    const validItems = items.filter(i => i.description.trim());

    const orderData = {
      clientId: form.clientId,
      status: form.status,
      title: form.title,
      description: form.description,
      equipment: form.equipment,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      defectReported: form.defectReported,
      technician: form.technician,
      warrantyDays: form.warrantyDays,
      items: validItems,
      discount: form.discount,
      notes: form.notes,
      payment: {
        method: form.paymentMethod,
        installments: form.paymentInstallments,
        paidAmount: form.paymentPaidAmount,
        notes: form.paymentNotes,
      },
    };

    if (editingOrder) {
      onUpdate(editingOrder.id, orderData);
    } else {
      onSave(orderData as Omit<ServiceOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            {editingOrder ? `Editar OS #${editingOrder.number}` : 'Nova Ordem de Servico'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Preencha as informacoes abaixo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">Dados Gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente *</label>
              <div className="flex gap-2">
                <select
                  value={form.clientId}
                  onChange={e => set('clientId', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <button type="button" onClick={onAddClient} className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition shrink-0" title="Novo cliente">+</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="orcamento">Orcamento</option>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Titulo do Servico *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex: Manutencao de Notebook Dell"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Descricao</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Descreva o servico a ser realizado..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tecnico Responsavel</label>
              <input
                type="text"
                value={form.technician}
                onChange={e => set('technician', e.target.value)}
                placeholder="Nome do tecnico"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Garantia (dias)</label>
              <input
                type="number"
                value={form.warrantyDays}
                onChange={e => set('warrantyDays', Number(e.target.value))}
                placeholder="90"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">Equipamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Equipamento</label>
              <input type="text" value={form.equipment} onChange={e => set('equipment', e.target.value)}
                placeholder="Notebook, Celular, etc."
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Marca</label>
              <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)}
                placeholder="Dell, Apple, Samsung..."
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Modelo</label>
              <input type="text" value={form.model} onChange={e => set('model', e.target.value)}
                placeholder="Inspiron 15 3000, iPhone 14..."
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">N de Serie</label>
              <input type="text" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)}
                placeholder="S/N do equipamento"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Defeito Relatado</label>
              <input type="text" value={form.defectReported} onChange={e => set('defectReported', e.target.value)}
                placeholder="Descreva o problema reportado pelo cliente"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">Itens e Servicos</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold transition">
              <Plus size={16} /> Adicionar
            </button>
          </div>

          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase px-1 mb-2">
            <span className="col-span-5">Descricao</span>
            <span className="col-span-2">Qtd</span>
            <span className="col-span-2">Valor Unit.</span>
            <span className="col-span-2 text-right">Subtotal</span>
            <span className="col-span-1"></span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="bg-slate-50 rounded-xl p-3 sm:p-2 border border-slate-100">
                <div className="sm:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Descricao do item/servico"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Qtd</label>
                      <input
                        type="number" min={1}
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Valor Unit.</label>
                      <input
                        type="number" min={0} step={0.01}
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Subtotal</label>
                      <div className="h-[38px] flex items-center justify-end text-sm font-bold text-slate-700">
                        {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Descricao do item/servico"
                    className="col-span-5 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="number" min={1}
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="number" min={0} step={0.01}
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <span className="col-span-2 text-right text-sm font-bold text-slate-700">
                    {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Subtotal:</span>
              <span className="text-sm text-slate-700">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Desconto (R$):</span>
              <input
                type="number" min={0} step={0.01}
                value={form.discount}
                onChange={e => set('discount', Number(e.target.value))}
                className="w-28 sm:w-32 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700">Total:</span>
              <span className="text-xl font-black text-slate-800">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">Pagamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Forma de Pagamento</label>
              <select
                value={form.paymentMethod}
                onChange={e => set('paymentMethod', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.entries(paymentLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Parcelas</label>
              <input type="number" value={form.paymentInstallments} onChange={e => set('paymentInstallments', Number(e.target.value))}
                placeholder="1" min={1}
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Pago (R$)</label>
              <input type="number" value={form.paymentPaidAmount} onChange={e => set('paymentPaidAmount', Number(e.target.value))}
                placeholder="0.00" min={0} step={0.01}
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Obs. Pagamento</label>
              <input type="text" value={form.paymentNotes} onChange={e => set('paymentNotes', e.target.value)}
                placeholder="Observacao sobre pagamento"
                className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">Observacoes</h2>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Observacoes adicionais..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition text-center">
            Cancelar
          </button>
          <button type="submit" className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/25">
            <Save size={18} />
            {editingOrder ? 'Salvar Alteracoes' : 'Criar Ordem de Servico'}
          </button>
        </div>
      </form>
    </div>
  );
}
