import { useMemo, useState } from 'react';
import { ClipboardList, Package, Warehouse, ChefHat } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { PageHeader } from '../components/PageHeader';
import { StockBadge } from '../components/StockBadge';
import { stockStatus, formatNumber, formatRupiah } from '../lib/utils';

export function KartuStokPage() {
  const { db } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);

  const cards = useMemo(() => {
    if (!db) return [];
    return db.barang.map((b) => {
      const gudang = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0;
      const dapurTotal = db.stok_dapur.filter((s) => s.id_barang === b.id).reduce((a, s) => a + s.qty, 0);
      return { barang: b, gudang, dapurTotal, total: gudang + dapurTotal };
    });
  }, [db]);

  const detail = useMemo(() => {
    if (!db || !selected) return null;
    const b = db.barang.find((x) => x.id === selected)!;
    const masuk = db.barang_masuk.filter((r) => r.id_barang === selected).map((r) => ({ tanggal: r.tanggal, jenis: 'Masuk', qty: r.qty, keterangan: db.supplier.find((s) => s.id === r.id_supplier)?.nama_supplier ?? '-', nominal: r.subtotal }));
    const keluar = db.barang_keluar.filter((r) => r.id_barang === selected).map((r) => ({ tanggal: r.tanggal, jenis: 'Distribusi', qty: r.qty, keterangan: db.dapur.find((d) => d.id === r.id_dapur)?.nama_dapur ?? '-', nominal: 0 }));
    const pakai = db.pemakaian_dapur.filter((r) => r.id_barang === selected).map((r) => ({ tanggal: r.tanggal, jenis: 'Pemakaian', qty: r.qty, keterangan: db.dapur.find((d) => d.id === r.id_dapur)?.nama_dapur ?? '-', nominal: 0 }));
    const movements = [...masuk, ...keluar, ...pakai].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return { barang: b, movements };
  }, [db, selected]);

  if (!db) return null;

  return (
    <div>
      <PageHeader title="Kartu Stok Barang" subtitle="Detail pergerakan stok per barang" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-2.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
          {cards.map((c) => {
            const isSel = selected === c.barang.id;
            return (
              <button key={c.barang.id} onClick={() => setSelected(c.barang.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${isSel ? 'border-blue-400 bg-blue-50/50 shadow-sm' : 'border-slate-200/70 bg-white hover:border-blue-200 hover:shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.barang.nama_barang}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{c.barang.kode_barang}</p>
                  </div>
                  <StockBadge status={stockStatus(c.gudang, c.barang)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><Warehouse className="h-3 w-3" />Gudang</p>
                    <p className="text-sm font-bold text-slate-700">{formatNumber(c.gudang)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><ChefHat className="h-3 w-3" />Dapur</p>
                    <p className="text-sm font-bold text-slate-700">{formatNumber(c.dapurTotal)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {!detail ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3"><ClipboardList className="h-7 w-7 text-blue-500" /></div>
              <p className="font-medium text-slate-600">Pilih barang untuk melihat kartu stok</p>
              <p className="text-sm text-slate-400 mt-1">Detail pergerakan masuk & keluar akan ditampilkan di sini</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center"><Package className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{detail.barang.nama_barang}</h3>
                    <p className="text-xs text-slate-400">{detail.barang.kode_barang} · Satuan: {detail.barang.satuan} · Min: {detail.barang.stok_minimum}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                    <p className="text-[11px] text-slate-500">Stok Gudang</p>
                    <p className="text-lg font-bold text-blue-700">{formatNumber(db.stok.find((s) => s.id_barang === detail.barang.id)?.stok_gudang ?? 0)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <p className="text-[11px] text-slate-500">Stok Dapur Total</p>
                    <p className="text-lg font-bold text-emerald-700">{formatNumber(db.stok_dapur.filter((s) => s.id_barang === detail.barang.id).reduce((a, s) => a + s.qty, 0))}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] text-slate-500">Total Stok</p>
                    <p className="text-lg font-bold text-slate-700">{formatNumber((db.stok.find((s) => s.id_barang === detail.barang.id)?.stok_gudang ?? 0) + db.stok_dapur.filter((s) => s.id_barang === detail.barang.id).reduce((a, s) => a + s.qty, 0))}</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Jenis</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase">Keterangan</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.movements.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Belum ada pergerakan stok</td></tr>
                    ) : detail.movements.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 text-slate-600 text-xs">{m.tanggal}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${m.jenis === 'Masuk' ? 'bg-blue-50 text-blue-700' : m.jenis === 'Distribusi' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{m.jenis}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs">{m.keterangan}</td>
                        <td className={`px-4 py-2.5 text-right font-semibold text-xs ${m.jenis === 'Masuk' ? 'text-blue-600' : 'text-slate-600'}`}>{m.jenis === 'Masuk' ? '+' : '−'}{formatNumber(m.qty)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-500 text-xs">{m.nominal ? formatRupiah(m.nominal) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
