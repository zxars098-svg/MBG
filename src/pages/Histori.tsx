import { useMemo, useState } from 'react';
import { History, ArrowDownToLine, ArrowUpFromLine, Flame } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { formatDate, formatNumber } from '../lib/utils';
import type { HistoriTransaksi } from '../lib/types';

const jenisStyle = {
  'Barang Masuk': { icon: ArrowDownToLine, cls: 'bg-blue-50 text-blue-700' },
  'Distribusi': { icon: ArrowUpFromLine, cls: 'bg-emerald-50 text-emerald-700' },
  'Pemakaian': { icon: Flame, cls: 'bg-amber-50 text-amber-700' },
} as const;

export function HistoriPage() {
  const { db } = useAuth();
  const [filter, setFilter] = useState<string>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    const list = filter === 'all' ? db.histori : db.histori.filter((h) => h.jenis_transaksi === filter);
    return [...list].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  }, [db, filter]);

  if (!db) return null;

  const columns: Column<HistoriTransaksi>[] = [
    { key: 'tanggal', label: 'Tanggal', sortValue: (r) => r.tanggal, render: (r) => <span className="text-slate-600 text-sm">{formatDate(r.tanggal)}</span> },
    { key: 'jenis_transaksi', label: 'Jenis', render: (r) => {
      const s = jenisStyle[r.jenis_transaksi];
      const Icon = s.icon;
      return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}><Icon className="h-3.5 w-3.5" />{r.jenis_transaksi}</span>;
    } },
    { key: 'barang', label: 'Barang', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-medium text-slate-700">{b?.nama_barang ?? '-'}</span>; } },
    { key: 'qty', label: 'Qty', align: 'right', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-semibold text-slate-700">{formatNumber(r.qty)} {b?.satuan}</span>; } },
    { key: 'keterangan', label: 'Keterangan', render: (r) => <span className="text-slate-500 text-sm">{r.keterangan}</span> },
  ];

  const counts = {
    all: db.histori.length,
    'Barang Masuk': db.histori.filter((h) => h.jenis_transaksi === 'Barang Masuk').length,
    'Distribusi': db.histori.filter((h) => h.jenis_transaksi === 'Distribusi').length,
    'Pemakaian': db.histori.filter((h) => h.jenis_transaksi === 'Pemakaian').length,
  };

  return (
    <div>
      <PageHeader title="Histori Transaksi" subtitle="Riwayat seluruh pergerakan stok" />

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'Barang Masuk', 'Distribusi', 'Pemakaian'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f === 'all' ? 'Semua' : f}
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><History className="h-7 w-7 text-slate-400" /></div>
          <p className="font-medium text-slate-600">Belum ada histori</p>
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} searchKeys={['keterangan']} searchPlaceholder="Cari keterangan..." pageSize={12} />
      )}
    </div>
  );
}
