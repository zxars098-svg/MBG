import type { Barang, StockStatus } from './types';

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n);
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function stockStatus(stok: number, barang: Barang): StockStatus {
  const min = barang.stok_minimum;
  if (stok <= min * 0.5) return 'habis';
  if (stok <= min) return 'menipis';
  return 'aman';
}

export function statusLabel(s: StockStatus): string {
  return s === 'aman' ? 'Aman' : s === 'menipis' ? 'Menipis' : 'Hampir Habis';
}

export function statusColor(s: StockStatus): { bg: string; text: string; dot: string } {
  switch (s) {
    case 'aman':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'menipis':
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    case 'habis':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
  }
}
