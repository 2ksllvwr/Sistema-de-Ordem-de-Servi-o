import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(date: Date | string | undefined, pattern = "dd/MM/yyyy"): string {
  if (!date) return '-';
  return format(new Date(date), pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDateFull(date: Date | string | undefined): string {
  if (!date) return '-';
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function calcSubtotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calcTotal(items: { quantity: number; unitPrice: number }[], discount: number): number {
  return calcSubtotal(items) - discount;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
