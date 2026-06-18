import { useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { ReportToolbar, FilterSelect, FilterDate } from '../components/ReportToolbar';
import { exportPDF, exportExcel, printReport } from '../lib/export';
import { formatDate, formatNumber } from '../lib/utils';

export function LaporanDistribusiPage() {
  const { db, user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [idDapur, setIdDapur] = useState('all');
  const [idBarang, setIdBarang] = useState('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.barang_keluar
      .filter((r) => (!from || r.tanggal >= from) && (!to || r.tanggal <= to))
      .filter((r) => idDapur === 'all' || r.id_dapur === Number(idDapur))
      .filter((r) => idBarang === 'all' || r.id_barang === Number(idBarang))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [db, from, to, idDapur, idBarang]);

  if (!db) return null;
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const periode = from || to ? `${from ? formatDate(from) : 'Awal'} s/d ${to ? formatDate(to) : 'Sekarang'}` : 'Semua Periode';
  const columns = ['No', 'Tanggal', 'Dapur Tujuan', 'Barang', 'Qty'];
  const data = rows.map((r, i) => [i + 1, r.tanggal, db.dapur.find((d) => d.id === r.id_dapur)?.nama_dapur ?? '-', db.barang.find((b) => b.id === r.id_barang)?.nama_barang ?? '-', `${r.qty} ${db.barang.find((b) => b.id === r.id_barang)?.satuan ?? ''}`]);
  const meta = { title: 'Laporan Distribusi Dapur', periode, adminName: user?.nama ?? 'Admin' };

  return (
    <div>
      <PageHeader title="Laporan Distribusi Dapur" subtitle="Rekap distribusi barang ke dapur" />

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 shadow-sm shadow-slate-200/40">
        <div className="flex flex-wrap items-end gap-3">
          <FilterDate label="Dari Tanggal" value={from} onChange={setFrom} />
          <FilterDate label="Sampai Tanggal" value={to} onChange={setTo} />
          <FilterSelect label="Dapur" value={idDapur} onChange={setIdDapur} options={[{ value: 'all', label: 'Semua Dapur' }, ...db.dapur.map((d) => ({ value: d.id, label: d.nama_dapur }))]} />
          <FilterSelect label="Barang" value={idBarang} onChange={setIdBarang} options={[{ value: 'all', label: 'Semua Barang' }, ...db.barang.map((b) => ({ value: b.id, label: b.nama_barang }))]} />
          <button onClick={() => { setFrom(''); setTo(''); setIdDapur('all'); setIdBarang('all'); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Reset</button>
        </div>
      </div>

      <ReportToolbar onPrint={() => printReport(meta, columns, data, 'portrait')} onPDF={() => exportPDF(meta, columns, data, 'portrait', [{ label: 'Total Distribusi', value: String(rows.length) }, { label: 'Total Qty', value: formatNumber(totalQty) }])} onExcel={() => exportExcel(meta, columns, data, 'Distribusi')}>
        <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-sm"><span className="text-emerald-600 font-medium">Total Qty: </span><span className="font-bold text-emerald-700">{formatNumber(totalQty)}</span></div>
        <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600"><span className="font-medium">{rows.length} transaksi</span></div>
      </ReportToolbar>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80"><tr>{columns.map((c) => <th key={c} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${c === 'Qty' || c === 'No' ? 'text-right' : 'text-left'}`}>{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Tidak ada data</td></tr> :
                rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-emerald-50/30">
                    <td className="px-4 py-3 text-right text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.tanggal)}</td>
                    <td className="px-4 py-3 text-slate-700">{db.dapur.find((d) => d.id === r.id_dapur)?.nama_dapur}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{db.barang.find((b) => b.id === r.id_barang)?.nama_barang}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatNumber(r.qty)} {db.barang.find((b) => b.id === r.id_barang)?.satuan}</td>
                  </tr>
                ))}
            </tbody>
            {rows.length > 0 && <tfoot><tr className="bg-slate-50 border-t-2 border-slate-200"><td colSpan={4} className="px-4 py-3 text-right font-semibold text-slate-700">Total Qty</td><td className="px-4 py-3 text-right font-bold text-emerald-700">{formatNumber(totalQty)}</td></tr></tfoot>}
          </table>
        </div>
      </div>
    </div>
  );
}
