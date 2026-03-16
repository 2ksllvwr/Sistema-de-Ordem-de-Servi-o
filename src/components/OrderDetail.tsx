import { useState } from 'react';
import { ServiceOrder, Client, CompanyInfo, OrderStatus, PrintDocType, statusLabels, statusColors, paymentLabels, paymentIcons } from '../types';
import { formatCurrency, formatDateTime, calcSubtotal, calcTotal } from '../utils/format';
import { ArrowLeft, Pencil, FileText, Calendar, User, Package, DollarSign, Shield, CreditCard, Printer, Receipt, FileCheck } from 'lucide-react';
import PrintDocument from './PrintDocument';

interface OrderDetailProps {
  order: ServiceOrder;
  client?: Client;
  company: CompanyInfo;
  onBack: () => void;
  onChangeStatus: (status: OrderStatus) => void;
  onEdit: () => void;
  onUpdateOrder: (data: Partial<ServiceOrder>) => void;
}

export default function OrderDetail({ order, client, company, onBack, onChangeStatus, onEdit, onUpdateOrder }: OrderDetailProps) {
  const [printDoc, setPrintDoc] = useState<PrintDocType | null>(null);
  const subtotal = calcSubtotal(order.items);
  const total = calcTotal(order.items, order.discount);

  const allStatuses: OrderStatus[] = ['orcamento', 'aberto', 'em_andamento', 'finalizado', 'cancelado'];
  const statusIndex = allStatuses.indexOf(order.status);

  const markAsPaid = () => {
    onUpdateOrder({
      payment: {
        ...order.payment,
        paidAmount: total,
        paidAt: new Date(),
      },
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">OS #{order.number}</h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{order.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border font-semibold ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition" title="Editar">
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Progresso do Serviço</h3>
        <div className="flex items-center gap-1">
          {allStatuses.filter(s => s !== 'cancelado').map((s) => {
            const isActive = allStatuses.indexOf(s) <= statusIndex && order.status !== 'cancelado';
            const isCurrent = s === order.status;
            return (
              <button
                key={s}
                onClick={() => onChangeStatus(s)}
                className={`flex-1 py-2 sm:py-2.5 px-1 rounded-lg text-[10px] sm:text-xs font-semibold text-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                    : isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {statusLabels[s]}
              </button>
            );
          })}
        </div>
        {order.status !== 'cancelado' && (
          <button
            onClick={() => onChangeStatus('cancelado')}
            className="mt-2 text-xs text-red-500 hover:text-red-700 transition font-medium"
          >
            ✕ Cancelar ordem
          </button>
        )}
      </div>

      {/* Print Buttons */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📄 Gerar Documentos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setPrintDoc('nota_servico')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition border border-blue-200"
          >
            <FileCheck size={22} />
            <span className="text-[11px] sm:text-xs font-bold text-center leading-tight">Nota de Serviço</span>
          </button>
          <button
            onClick={() => setPrintDoc('orcamento')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition border border-purple-200"
          >
            <FileText size={22} />
            <span className="text-[11px] sm:text-xs font-bold text-center leading-tight">Orçamento</span>
          </button>
          <button
            onClick={() => setPrintDoc('garantia')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition border border-amber-200"
          >
            <Shield size={22} />
            <span className="text-[11px] sm:text-xs font-bold text-center leading-tight">Garantia</span>
          </button>
          <button
            onClick={() => setPrintDoc('recibo')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200"
          >
            <Receipt size={22} />
            <span className="text-[11px] sm:text-xs font-bold text-center leading-tight">Recibo</span>
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Client */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-700 text-sm">Cliente</h3>
          </div>
          {client ? (
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-slate-800">{client.name}</p>
              <p className="text-slate-500 text-xs">{client.cpfCnpj}</p>
              <p className="text-slate-500 text-xs">{client.phone}</p>
              <p className="text-slate-500 text-xs">{client.email}</p>
              <p className="text-slate-500 text-xs">{client.address}{client.city ? `, ${client.city}/${client.state}` : ''}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Cliente não encontrado</p>
          )}
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-700 text-sm">Equipamento</h3>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Equipamento:</span>
              <span className="text-slate-800 font-medium text-xs">{order.equipment || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Marca:</span>
              <span className="text-slate-800 text-xs">{order.brand || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Modelo:</span>
              <span className="text-slate-800 text-xs">{order.model || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Nº Série:</span>
              <span className="text-slate-800 font-mono text-xs">{order.serialNumber || '-'}</span>
            </div>
            {order.defectReported && (
              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-slate-500 text-[11px] block mb-0.5">Defeito Relatado:</span>
                <span className="text-slate-700 text-xs">{order.defectReported}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-700 text-sm">Datas</h3>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between gap-2"><span className="text-slate-500">Criado:</span><span className="text-slate-800 text-right">{formatDateTime(order.createdAt)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-slate-500">Atualizado:</span><span className="text-slate-800 text-right">{formatDateTime(order.updatedAt)}</span></div>
            {order.finishedAt && <div className="flex justify-between gap-2"><span className="text-slate-500">Finalizado:</span><span className="text-emerald-600 font-medium text-right">{formatDateTime(order.finishedAt)}</span></div>}
            {order.deliveredAt && <div className="flex justify-between gap-2"><span className="text-slate-500">Entregue:</span><span className="text-blue-600 font-medium text-right">{formatDateTime(order.deliveredAt)}</span></div>}
            <div className="flex justify-between gap-2"><span className="text-slate-500">Técnico:</span><span className="text-slate-800 font-medium text-right">{order.technician || '-'}</span></div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-emerald-500" />
            <h3 className="font-bold text-slate-700 text-sm">Pagamento</h3>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Forma:</span>
              <span className="text-slate-800 font-medium flex items-center gap-1">
                <span>{paymentIcons[order.payment.method]}</span>
                {paymentLabels[order.payment.method]}
              </span>
            </div>
            {order.payment.installments > 1 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Parcelas:</span>
                <span className="text-slate-800">{order.payment.installments}x de {formatCurrency(total / order.payment.installments)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Valor Total:</span>
              <span className="text-slate-800 font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor Pago:</span>
              <span className={order.payment.paidAmount >= total ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                {formatCurrency(order.payment.paidAmount)}
              </span>
            </div>
            {order.payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Data Pgto:</span>
                <span className="text-slate-800">{formatDateTime(order.payment.paidAt)}</span>
              </div>
            )}
            {order.payment.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1">{order.payment.notes}</p>
            )}
            {order.payment.paidAmount < total && order.status !== 'cancelado' && (
              <button
                onClick={markAsPaid}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition"
              >
                <DollarSign size={14} />
                Marcar como Pago ({formatCurrency(total)})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {order.description && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-700 text-sm">Descrição do Serviço</h3>
          </div>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.description}</p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Printer size={18} className="text-slate-500" />
            Itens / Serviços ({order.items.length})
          </h3>
        </div>

        {/* Mobile items */}
        <div className="sm:hidden divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={item.id} className="p-4 space-y-1">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-700 flex-1">{idx + 1}. {item.description}</p>
                <span className="font-bold text-slate-800 text-sm ml-2">{formatCurrency(item.quantity * item.unitPrice)}</span>
              </div>
              <p className="text-xs text-slate-500">
                {item.quantity}x {formatCurrency(item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase">#</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase">Descrição</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase text-center">Qtd</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase text-right">Unit.</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{item.description}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5 bg-slate-50/50 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal:</span>
            <span className="text-slate-700">{formatCurrency(subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Desconto:</span>
              <span className="text-red-500">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700">Total:</span>
            <span className="text-lg sm:text-xl font-black text-slate-800">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Warranty */}
      {order.warrantyDays > 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800 text-sm">Garantia</h3>
          </div>
          <p className="text-sm text-amber-700">
            Este serviço possui garantia de <strong>{order.warrantyDays} dias</strong> a partir da data de conclusão.
          </p>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 text-sm mb-1">📝 Observações</h3>
          <p className="text-sm text-blue-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      {/* Print Modal */}
      {printDoc && (
        <PrintDocument
          order={order}
          client={client}
          company={company}
          docType={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
}
