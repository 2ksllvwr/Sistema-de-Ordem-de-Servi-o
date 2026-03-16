export type OrderStatus = 'orcamento' | 'aberto' | 'em_andamento' | 'finalizado' | 'cancelado';

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'cheque' | 'pendente';

export type PrintDocType = 'nota_servico' | 'orcamento' | 'garantia' | 'recibo';

export type ExpenseCategory =
  | 'pecas'
  | 'aparelhos_danificados'
  | 'ferramentas'
  | 'aluguel'
  | 'energia'
  | 'internet'
  | 'salarios'
  | 'marketing'
  | 'transporte'
  | 'impostos'
  | 'materiais'
  | 'outros';

export interface CompanyInfo {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
  city: string;
  state: string;
  createdAt: Date;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  installments: number;
  paidAmount: number;
  paidAt?: Date;
  notes: string;
}

export interface ServiceOrder {
  id: string;
  number: number;
  clientId: string;
  status: OrderStatus;
  title: string;
  description: string;
  items: ServiceItem[];
  discount: number;
  notes: string;
  equipment: string;
  brand: string;
  model: string;
  serialNumber: string;
  defectReported: string;
  technician: string;
  warrantyDays: number;
  payment: PaymentInfo;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  deliveredAt?: Date;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  notes: string;
  createdAt: Date;
}

export const statusLabels: Record<OrderStatus, string> = {
  orcamento: 'Orçamento',
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export const statusColors: Record<OrderStatus, string> = {
  orcamento: 'bg-purple-100 text-purple-800 border-purple-300',
  aberto: 'bg-blue-100 text-blue-800 border-blue-300',
  em_andamento: 'bg-amber-100 text-amber-800 border-amber-300',
  finalizado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

export const statusIcons: Record<OrderStatus, string> = {
  orcamento: '📋',
  aberto: '📂',
  em_andamento: '⚙️',
  finalizado: '✅',
  cancelado: '❌',
};

export const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  boleto: 'Boleto Bancário',
  transferencia: 'Transferência Bancária',
  cheque: 'Cheque',
  pendente: 'Pendente',
};

export const paymentIcons: Record<PaymentMethod, string> = {
  dinheiro: '💵',
  pix: '📱',
  cartao_credito: '💳',
  cartao_debito: '💳',
  boleto: '📄',
  transferencia: '🏦',
  cheque: '📝',
  pendente: '⏳',
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  pecas: 'Compra de Peças',
  aparelhos_danificados: 'Aparelhos Danificados',
  ferramentas: 'Ferramentas / Equipamentos',
  aluguel: 'Aluguel',
  energia: 'Energia Elétrica',
  internet: 'Internet / Telefone',
  salarios: 'Salários / Pagamentos',
  marketing: 'Marketing / Publicidade',
  transporte: 'Transporte / Combustível',
  impostos: 'Impostos / Taxas',
  materiais: 'Materiais de Escritório',
  outros: 'Outros',
};

export const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  pecas: '🔧',
  aparelhos_danificados: '📱',
  ferramentas: '🛠️',
  aluguel: '🏢',
  energia: '⚡',
  internet: '🌐',
  salarios: '👤',
  marketing: '📢',
  transporte: '🚗',
  impostos: '📑',
  materiais: '📦',
  outros: '📌',
};

export const defaultCompany: CompanyInfo = {
  name: 'Astra Tech',
  cnpj: '00.000.000/0001-00',
  phone: '(00) 0000-0000',
  email: 'contato@astratech.com.br',
  address: 'Endereço da empresa',
};
