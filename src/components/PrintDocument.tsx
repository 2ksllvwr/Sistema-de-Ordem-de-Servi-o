import { ServiceOrder, Client, CompanyInfo, PrintDocType, paymentLabels, statusLabels } from '../types';
import { formatCurrency, formatDate, formatDateFull, calcSubtotal, calcTotal } from '../utils/format';
import { X, Printer } from 'lucide-react';

interface PrintDocumentProps {
  order: ServiceOrder;
  client?: Client;
  company: CompanyInfo;
  docType: PrintDocType;
  onClose: () => void;
}

const docTitles: Record<PrintDocType, string> = {
  nota_servico: 'NOTA DE SERVIÇO',
  orcamento: 'ORÇAMENTO',
  garantia: 'TERMO DE GARANTIA',
  recibo: 'RECIBO DE PAGAMENTO',
};

export default function PrintDocument({ order, client, company, docType, onClose }: PrintDocumentProps) {
  const subtotal = calcSubtotal(order.items);
  const total = calcTotal(order.items, order.discount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center overflow-auto py-4 sm:py-8">
      {/* Toolbar - não imprime */}
      <div className="fixed top-4 right-4 z-[110] flex gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium shadow-lg transition-colors text-sm"
        >
          <Printer size={18} />
          <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
          <span className="sm:hidden">Imprimir</span>
        </button>
        <button
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-xl shadow-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Documento */}
      <div className="bg-white w-full sm:w-[210mm] min-h-[297mm] shadow-2xl print-document mx-auto" id="print-area">
        <div className="p-5 sm:p-10">
          {/* ===== CABEÇALHO DA EMPRESA ===== */}
          <div className="border-b-4 border-slate-800 pb-4 sm:pb-5 mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{company.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">CNPJ: {company.cnpj}</p>
                <p className="text-xs sm:text-sm text-slate-600">{company.address}</p>
                <p className="text-xs sm:text-sm text-slate-600">{company.phone} | {company.email}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-lg inline-block">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest">{docTitles[docType]}</p>
                  <p className="text-lg sm:text-xl font-bold">Nº {order.number.toString().padStart(4, '0')}</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Emissão: {formatDate(new Date())}
                </p>
              </div>
            </div>
          </div>

          {/* ===== DADOS DO CLIENTE ===== */}
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 border border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dados do Cliente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs sm:text-sm">
              <div className="flex gap-2">
                <span className="text-slate-500 font-medium min-w-[70px] sm:min-w-[80px]">Nome:</span>
                <span className="text-slate-800 font-semibold">{client?.name || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 font-medium min-w-[70px] sm:min-w-[80px]">CPF/CNPJ:</span>
                <span className="text-slate-800">{client?.cpfCnpj || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 font-medium min-w-[70px] sm:min-w-[80px]">Telefone:</span>
                <span className="text-slate-800">{client?.phone || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 font-medium min-w-[70px] sm:min-w-[80px]">Email:</span>
                <span className="text-slate-800">{client?.email || 'N/A'}</span>
              </div>
              <div className="col-span-1 sm:col-span-2 flex gap-2">
                <span className="text-slate-500 font-medium min-w-[70px] sm:min-w-[80px]">Endereço:</span>
                <span className="text-slate-800">
                  {client ? `${client.address} - ${client.city}/${client.state}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* ===== DADOS DO EQUIPAMENTO ===== */}
          {(docType === 'nota_servico' || docType === 'garantia') && (
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 border border-blue-200">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Dados do Equipamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs sm:text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[90px] sm:min-w-[100px]">Equipamento:</span>
                  <span className="text-slate-800 font-semibold">{order.equipment || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[90px] sm:min-w-[100px]">Marca:</span>
                  <span className="text-slate-800">{order.brand || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[90px] sm:min-w-[100px]">Modelo:</span>
                  <span className="text-slate-800">{order.model || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[90px] sm:min-w-[100px]">Nº de Série:</span>
                  <span className="text-slate-800">{order.serialNumber || '-'}</span>
                </div>
                {order.defectReported && order.defectReported !== '-' && (
                  <div className="col-span-1 sm:col-span-2 flex gap-2">
                    <span className="text-slate-500 font-medium min-w-[90px] sm:min-w-[100px]">Defeito:</span>
                    <span className="text-slate-800">{order.defectReported}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== INFORMAÇÕES DA OS ===== */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6 text-xs sm:text-sm">
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Status</p>
              <p className="font-bold text-slate-800 text-[11px] sm:text-sm">{statusLabels[order.status]}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Data Abertura</p>
              <p className="font-bold text-slate-800 text-[11px] sm:text-sm">{formatDate(order.createdAt)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Técnico</p>
              <p className="font-bold text-slate-800 text-[11px] sm:text-sm">{order.technician || '-'}</p>
            </div>
          </div>

          {/* ===== DESCRIÇÃO DO SERVIÇO ===== */}
          {order.description && docType !== 'garantia' && (
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição do Serviço</h2>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">{order.description}</p>
            </div>
          )}

          {/* ===== TABELA DE ITENS/SERVIÇOS ===== */}
          {docType !== 'garantia' && (
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Itens e Serviços</h2>
              <table className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-2 sm:px-3 py-2 text-left font-semibold text-[10px] sm:text-xs">#</th>
                    <th className="px-2 sm:px-3 py-2 text-left font-semibold text-[10px] sm:text-xs">DESCRIÇÃO</th>
                    <th className="px-2 sm:px-3 py-2 text-center font-semibold text-[10px] sm:text-xs">QTD</th>
                    <th className="px-2 sm:px-3 py-2 text-right font-semibold text-[10px] sm:text-xs">UNIT.</th>
                    <th className="px-2 sm:px-3 py-2 text-right font-semibold text-[10px] sm:text-xs">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-2 sm:px-3 py-2 text-slate-500">{idx + 1}</td>
                      <td className="px-2 sm:px-3 py-2 text-slate-800 font-medium">{item.description}</td>
                      <td className="px-2 sm:px-3 py-2 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-2 sm:px-3 py-2 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-2 sm:px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div className="flex justify-end mt-3">
                <div className="w-full sm:w-64 space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="text-slate-700">{formatCurrency(subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-500">Desconto:</span>
                      <span className="text-red-600">- {formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base pt-2 border-t-2 border-slate-800">
                    <span className="font-bold text-slate-800">TOTAL:</span>
                    <span className="font-black text-slate-800 text-base sm:text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== FORMA DE PAGAMENTO ===== */}
          {(docType === 'nota_servico' || docType === 'recibo') && (
            <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 border border-emerald-200">
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Informações de Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs sm:text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Forma de Pgto:</span>
                  <span className="text-slate-800 font-semibold">{paymentLabels[order.payment.method]}</span>
                </div>
                {order.payment.installments > 1 && (
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Parcelas:</span>
                    <span className="text-slate-800">{order.payment.installments}x de {formatCurrency(total / order.payment.installments)}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Valor Total:</span>
                  <span className="text-slate-800 font-bold">{formatCurrency(total)}</span>
                </div>
                {order.payment.paidAmount > 0 && (
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Valor Pago:</span>
                    <span className="text-emerald-700 font-bold">{formatCurrency(order.payment.paidAmount)}</span>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Data Pgto:</span>
                    <span className="text-slate-800">{formatDate(order.payment.paidAt)}</span>
                  </div>
                )}
                {order.payment.notes && (
                  <div className="col-span-1 sm:col-span-2 flex gap-2">
                    <span className="text-slate-500 font-medium min-w-[100px] sm:min-w-[120px]">Observação:</span>
                    <span className="text-slate-700">{order.payment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== RECIBO - DECLARAÇÃO ===== */}
          {docType === 'recibo' && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 border-2 border-slate-300 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Recebi(emos) de <strong>{client?.name || 'N/A'}</strong>, CPF/CNPJ <strong>{client?.cpfCnpj || 'N/A'}</strong>,
                a importância de <strong>{formatCurrency(order.payment.paidAmount || total)}</strong> ({' '}
                {(order.payment.paidAmount || total).toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2 })} reais),
                referente aos serviços descritos na Ordem de Serviço nº <strong>{order.number.toString().padStart(4, '0')}</strong>.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos legais.
              </p>
            </div>
          )}

          {/* ===== GARANTIA - TERMOS ===== */}
          {docType === 'garantia' && (
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Termos de Garantia</h2>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl sm:text-2xl">🛡️</span>
                  <span className="text-base sm:text-lg font-bold text-amber-800">
                    Garantia de {order.warrantyDays} dias
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-700">
                  Válida a partir de {formatDateFull(order.finishedAt || new Date())}
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Serviço Realizado:</h3>
                  <p>{order.title} — {order.description}</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Condições da Garantia:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>A garantia cobre exclusivamente o serviço descrito neste termo.</li>
                    <li>O prazo de garantia é de <strong>{order.warrantyDays} dias corridos</strong>, contados a partir da data de entrega.</li>
                    <li>A garantia não cobre defeitos causados por mau uso, quedas, líquidos, instalação de software não autorizado ou modificações por terceiros.</li>
                    <li>Para acionar a garantia, o cliente deve apresentar este termo junto com o equipamento.</li>
                    <li>Peças substituídas durante o reparo que apresentem defeito de fabricação serão trocadas sem custo adicional dentro do prazo de garantia.</li>
                    <li>O prazo para análise e reparo em garantia é de até 30 (trinta) dias úteis.</li>
                    <li>A {company.name} se reserva o direito de analisar o equipamento para verificar as condições de garantia.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Situações que INVALIDAM a garantia:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>Danos causados por quedas, impacto ou uso inadequado</li>
                    <li>Contato com líquidos ou umidade excessiva</li>
                    <li>Violação de lacres ou abertura por técnico não autorizado</li>
                    <li>Uso de peças ou acessórios não originais/compatíveis</li>
                    <li>Danos causados por variação de energia elétrica (sem uso de estabilizador/nobreak)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ===== OBSERVAÇÕES ===== */}
          {order.notes && docType !== 'garantia' && (
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</h2>
              <p className="text-xs sm:text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200">{order.notes}</p>
            </div>
          )}

          {/* ===== VALIDADE (para orçamento) ===== */}
          {docType === 'orcamento' && (
            <div className="mb-5 sm:mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs sm:text-sm text-purple-700 font-medium">
                ⏰ Este orçamento é válido por <strong>15 dias</strong> a partir da data de emissão.
                Após este prazo, os valores poderão sofrer alterações.
              </p>
            </div>
          )}

          {/* ===== ASSINATURAS ===== */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="grid grid-cols-2 gap-6 sm:gap-12">
              <div className="text-center">
                <div className="border-t-2 border-slate-400 pt-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">{company.name}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">CNPJ: {company.cnpj}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-slate-400 pt-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">{client?.name || 'Cliente'}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">CPF/CNPJ: {client?.cpfCnpj || 'N/A'}</p>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-4 sm:mt-6">
              {company.address} | {company.phone} | {company.email}
            </p>
            <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-1">
              Documento gerado em {formatDateFull(new Date())} — {docTitles[docType]} #{order.number.toString().padStart(4, '0')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
