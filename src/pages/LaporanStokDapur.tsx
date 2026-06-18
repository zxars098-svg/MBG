import { useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { ReportToolbar, FilterSelect } from '../components/ReportToolbar';
import { exportPDF, exportExcel, printReport } from '../lib/export';
import { formatNumber } from '../lib/utils';
import { ChefHat } from 'lucide-react';

export function LaporanStokDapurPage() {
  const { db, user } = useAuth();
  const [idDapur, setIdDapur] = useState('all');
  const [idBarang, setIdBarang] = useState('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.stok_dapur
      .filter((s) => idDapur === 'all' || s.id_dapur === Number(idDapur))
      .filter((s) => idBarang === 'all' || s.id_barang === Number(idBarang))
      .map((s) => ({ ...s, dapur: db.dapur.find((d) => d.id === s.id_dapur)!, barang: db.barang.find((b) => b.id === s.id_barang)! }))
      .filter((r) => r.dapur && r.barang)
      .sort((a, b) => a.dapur.nama_dapur.localeCompare(b.dapur.nama_dapur) || a.barang.nama_barang.localeCompare(b.barang.nama_barang));
  }, [db, idDapur, idBarang]);

  if (!db) return null;
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const columns = ['No', 'Dapur', 'Kode Barang', 'Nama Barang', 'Satuan', 'Stok Dapur'];
  const data = rows.map((r, i) => [i + 1, r.dapur.nama_dapur, r.barang.kode_barang, r.barang.nama_barang, r.barang.satuan, r.qty]);
  const meta = { title: 'Laporan Stok Per Dapur (Realtime)', periode: `Per ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, adminName: user?.nama ?? 'Admin' };

  // summary per dapur
  const perDapur = db.dapur.map((d) => ({
    dapur: d,
    total: db.stok_dapur.filter((s) => s.id_dapur === d.id).reduce((a, s) => a + s.qty, 0),
    items: db.stok_dapur.filter((s) => s.id_dapur === d.id).length,
  }));

  return (
    <div>
      <PageHeader title="Laporan Stok Per Dapur" subtitle="Posisi stok bahan di setiap dapur (realtime)" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {perDapur.map((d) => (
          <div key={d.dapur.id} className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/30"><ChefHat className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{d.dapur.nama_dapur}</p>
              <p className="text-xs text-slate-400">{d.items} jenis · {formatNumber(d.total)} stok</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 shadow-sm shadow-slate-200/40">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Dapur" value={idDapur} onChange={setIdDapur} options={[{ value: 'all', label: 'Semua Dapur' }, ...db.dapur.map((d) => ({ value: d.id, label: d.nama_dapur }))]} />
          <FilterSelect label="Barang" value={idBarang} onChange={setIdBarang} options={[{ value: 'all', label: 'Semua Barang' }, ...db.barang.map((b) => ({ value: b.id, label: b.nama_barang }))]} />
          <button onClick={() => { setIdDapur('all'); setIdBarang('all'); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Reset</button>
        </div>
      </div>

      <ReportToolbar onPrint={() => printReport(meta, columns, data, 'portrait')} onPDF={() => exportPDF(meta, columns, data, 'portrait', [{ label: 'Total Item', value: String(rows.length) }, { label: 'Total Stok', value: formatNumber(totalQty) }])} onExcel={() => exportExcel(meta, columns, data, 'Stok Dapur')}>
        <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-sm"><span className="text-emerald-600 font-medium">Total Stok Dapur: </span><span className="font-bold text-emerald-700">{formatNumber(totalQty)}</span></div>
        <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600"><span className="font-medium">{rows.length} item</span></div>
      </ReportToolbar>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80"><tr>{columns.map((c) => <th key={c} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${['No', 'Stok Dapur'].includes(c) ? 'text-right' : 'text-left'}`}>{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Tidak ada data</td></tr> :
                rows.map((r, i) => (
                  <tr key={`${r.id_dapur}-${r.id_barang}`} className="hover:bg-emerald-50/30">
                    <td className="px-4 py-3 text-right text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-700">{r.dapur.nama_dapur}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{r.barang.kode_barang}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{r.barang.nama_barang}</td>
                    <td className="px-4 py-3 text-slate-600">{r.barang.satuan}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatNumber(r.qty)} {r.barang.satuan}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
