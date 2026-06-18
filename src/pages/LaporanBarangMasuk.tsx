import { useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { ReportToolbar, FilterSelect, FilterDate } from '../components/ReportToolbar';
import { exportPDF, exportExcel, printReport } from '../lib/export';
import { formatDate, formatRupiah, formatNumber } from '../lib/utils';

export function LaporanBarangMasukPage() {
  const { db, user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [idSupplier, setIdSupplier] = useState('all');
  const [idBarang, setIdBarang] = useState('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.barang_masuk
      .filter((r) => (!from || r.tanggal >= from) && (!to || r.tanggal <= to))
      .filter((r) => idSupplier === 'all' || r.id_supplier === Number(idSupplier))
      .filter((r) => idBarang === 'all' || r.id_barang === Number(idBarang))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [db, from, to, idSupplier, idBarang]);

  if (!db) return null;

  const total = rows.reduce((s, r) => s + r.subtotal, 0);
  const periode = from || to ? `${from ? formatDate(from) : 'Awal'} s/d ${to ? formatDate(to) : 'Sekarang'}` : 'Semua Periode';

  const columns = ['No', 'Tanggal', 'Supplier', 'Barang', 'Qty', 'Harga', 'Subtotal'];
  const data = rows.map((r, i) => [i + 1, r.tanggal, db.supplier.find((s) => s.id === r.id_supplier)?.nama_supplier ?? '-', db.barang.find((b) => b.id === r.id_barang)?.nama_barang ?? '-', `${r.qty} ${db.barang.find((b) => b.id === r.id_barang)?.satuan ?? ''}`, formatRupiah(r.harga), formatRupiah(r.subtotal)]);
  const meta = { title: 'Laporan Barang Masuk', periode, adminName: user?.nama ?? 'Admin' };

  return (
    <div>
      <PageHeader title="Laporan Barang Masuk" subtitle="Rekap penerimaan barang dari supplier" />

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 shadow-sm shadow-slate-200/40">
        <div className="flex flex-wrap items-end gap-3">
          <FilterDate label="Dari Tanggal" value={from} onChange={setFrom} />
          <FilterDate label="Sampai Tanggal" value={to} onChange={setTo} />
          <FilterSelect label="Supplier" value={idSupplier} onChange={setIdSupplier} options={[{ value: 'all', label: 'Semua Supplier' }, ...db.supplier.map((s) => ({ value: s.id, label: s.nama_supplier }))]} />
          <FilterSelect label="Barang" value={idBarang} onChange={setIdBarang} options={[{ value: 'all', label: 'Semua Barang' }, ...db.barang.map((b) => ({ value: b.id, label: b.nama_barang }))]} />
          <button onClick={() => { setFrom(''); setTo(''); setIdSupplier('all'); setIdBarang('all'); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">Reset</button>
        </div>
      </div>

      <ReportToolbar onPrint={() => printReport(meta, columns, data, 'landscape')} onPDF={() => exportPDF(meta, columns, data, 'landscape', [{ label: 'Total Transaksi', value: String(rows.length) }, { label: 'Total Belanja', value: formatRupiah(total) }])} onExcel={() => exportExcel(meta, columns, data, 'Barang Masuk')}>
        <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm">
          <span className="text-blue-600 font-medium">Total Belanja: </span><span className="font-bold text-blue-700">{formatRupiah(total)}</span>
        </div>
        <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">
          <span className="font-medium">{rows.length} transaksi</span>
        </div>
      </ReportToolbar>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80">
              <tr>{columns.map((c) => <th key={c} className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase ${c === 'Qty' || c === 'Harga' || c === 'Subtotal' || c === 'No' ? 'text-right' : 'text-left'}`}>{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Tidak ada data</td></tr> :
                rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-blue-50/30">
                    <td className="px-4 py-3 text-right text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.tanggal)}</td>
                    <td className="px-4 py-3 text-slate-700">{db.supplier.find((s) => s.id === r.id_supplier)?.nama_supplier}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{db.barang.find((b) => b.id === r.id_barang)?.nama_barang}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatNumber(r.qty)} {db.barang.find((b) => b.id === r.id_barang)?.satuan}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatRupiah(r.harga)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatRupiah(r.subtotal)}</td>
                  </tr>
                ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot><tr className="bg-slate-50 border-t-2 border-slate-200"><td colSpan={6} className="px-4 py-3 text-right font-semibold text-slate-700">Total Belanja</td><td className="px-4 py-3 text-right font-bold text-blue-700">{formatRupiah(total)}</td></tr></tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
