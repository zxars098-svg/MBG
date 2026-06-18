import { useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { ReportToolbar, FilterSelect } from '../components/ReportToolbar';
import { exportPDF, exportExcel, printReport } from '../lib/export';
import { formatNumber } from '../lib/utils';
import { stockStatus } from '../lib/utils';
import { StockBadge } from '../components/StockBadge';

export function LaporanStokGudangPage() {
  const { db, user } = useAuth();
  const [idBarang, setIdBarang] = useState('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.barang
      .filter((b) => idBarang === 'all' || b.id === Number(idBarang))
      .map((b) => ({ barang: b, stok: db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0 }))
      .sort((a, b) => a.barang.kode_barang.localeCompare(b.barang.kode_barang));
  }, [db, idBarang]);

  if (!db) return null;
  const totalStok = rows.reduce((s, r) => s + r.stok, 0);
  const lowCount = rows.filter((r) => r.stok <= r.barang.stok_minimum).length;
  const columns = ['No', 'Kode', 'Nama Barang', 'Satuan', 'Stok Minimum', 'Stok Gudang', 'Status'];
  const data = rows.map((r, i) => [i + 1, r.barang.kode_barang, r.barang.nama_barang, r.barang.satuan, r.barang.stok_minimum, r.stok, stockStatus(r.stok, r.barang) === 'aman' ? 'Aman' : stockStatus(r.stok, r.barang) === 'menipis' ? 'Menipis' : 'Hampir Habis']);
  const meta = { title: 'Laporan Stok Gudang (Realtime)', periode: `Per ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, adminName: user?.nama ?? 'Admin' };

  return (
    <div>
      <PageHeader title="Laporan Stok Gudang" subtitle="Posisi stok gudang realtime (tanpa harga)" />

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 shadow-sm shadow-slate-200/40">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Barang" value={idBarang} onChange={setIdBarang} options={[{ value: 'all', label: 'Semua Barang' }, ...db.barang.map((b) => ({ value: b.id, label: b.nama_barang }))]} />
          <button onClick={() => setIdBarang('all')} className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Reset</button>
        </div>
      </div>

      <ReportToolbar onPrint={() => printReport(meta, columns, data, 'portrait')} onPDF={() => exportPDF(meta, columns, data, 'portrait', [{ label: 'Total Jenis Barang', value: String(rows.length) }, { label: 'Total Stok', value: formatNumber(totalStok) }, { label: 'Stok Menipis', value: String(lowCount) }])} onExcel={() => exportExcel(meta, columns, data, 'Stok Gudang')}>
        <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm"><span className="text-blue-600 font-medium">Total Stok: </span><span className="font-bold text-blue-700">{formatNumber(totalStok)}</span></div>
        <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-100 text-sm"><span className="text-amber-600 font-medium">Stok Menipis: </span><span className="font-bold text-amber-700">{lowCount}</span></div>
      </ReportToolbar>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80"><tr>{columns.map((c) => <th key={c} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${['No', 'Stok Minimum', 'Stok Gudang'].includes(c) ? 'text-right' : c === 'Status' ? 'text-center' : 'text-left'}`}>{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={r.barang.id} className="hover:bg-blue-50/30">
                  <td className="px-4 py-3 text-right text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{r.barang.kode_barang}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.barang.nama_barang}</td>
                  <td className="px-4 py-3 text-slate-600">{r.barang.satuan}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatNumber(r.barang.stok_minimum)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{formatNumber(r.stok)} {r.barang.satuan}</td>
                  <td className="px-4 py-3 text-center"><StockBadge status={stockStatus(r.stok, r.barang)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
