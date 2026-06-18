import { useState } from 'react';
import { Plus, Trash2, ArrowUpFromLine, Calendar, ChefHat, Package } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { nextId } from '../lib/db';
import { formatDate, todayISO, formatNumber } from '../lib/utils';
import type { BarangKeluar } from '../lib/types';

export function DistribusiPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ tanggal: todayISO(), id_dapur: 0, id_barang: 0, qty: 0 });

  if (!db) return null;

  const availableStok = db.stok.find((s) => s.id_barang === form.id_barang)?.stok_gudang ?? 0;

  const save = () => {
    if (!form.tanggal || !form.id_dapur || !form.id_barang) { toast('warning', 'Lengkapi semua field'); return; }
    if (form.qty <= 0) { toast('warning', 'Qty harus lebih dari 0'); return; }
    if (form.qty > availableStok) { toast('error', `Stok gudang tidak cukup. Tersedia: ${availableStok}`); return; }
    const id = nextId(db.barang_keluar);
    const rec: BarangKeluar = { id, tanggal: form.tanggal, id_dapur: form.id_dapur, id_barang: form.id_barang, qty: form.qty };
    const barang = db.barang.find((b) => b.id === form.id_barang)!;
    const dapur = db.dapur.find((d) => d.id === form.id_dapur)!;
    // update stok gudang (kurang), stok dapur (tambah)
    const existingDapur = db.stok_dapur.find((s) => s.id_dapur === form.id_dapur && s.id_barang === form.id_barang);
    setDb((d) => ({
      ...d,
      barang_keluar: [...d.barang_keluar, rec],
      stok: d.stok.map((s) => s.id_barang === form.id_barang ? { ...s, stok_gudang: s.stok_gudang - form.qty } : s),
      stok_dapur: existingDapur
        ? d.stok_dapur.map((s) => s.id === existingDapur.id ? { ...s, qty: s.qty + form.qty } : s)
        : [...d.stok_dapur, { id: nextId(d.stok_dapur), id_dapur: form.id_dapur, id_barang: form.id_barang, qty: form.qty }],
      histori: [...d.histori, { id: nextId(d.histori), tanggal: form.tanggal, jenis_transaksi: 'Distribusi', id_barang: form.id_barang, qty: form.qty, keterangan: `Distribusi ke ${dapur.nama_dapur}` }],
    }));
    addAudit('Distribusi', 'Barang Keluar', `Distribusi ${form.qty} ${barang.satuan} ${barang.nama_barang} ke ${dapur.nama_dapur}`);
    toast('success', `${form.qty} ${barang.satuan} ${barang.nama_barang} didistribusi ke ${dapur.nama_dapur}`);
    setOpen(false);
    setForm({ tanggal: todayISO(), id_dapur: 0, id_barang: 0, qty: 0 });
  };

  const confirmDelete = () => {
    if (!delId) return;
    const rec = db.barang_keluar.find((x) => x.id === delId);
    if (!rec) return;
    setDb((d) => ({
      ...d,
      barang_keluar: d.barang_keluar.filter((x) => x.id !== delId),
      stok: d.stok.map((s) => s.id_barang === rec.id_barang ? { ...s, stok_gudang: s.stok_gudang + rec.qty } : s),
      stok_dapur: d.stok_dapur.map((s) => s.id_dapur === rec.id_dapur && s.id_barang === rec.id_barang ? { ...s, qty: Math.max(0, s.qty - rec.qty) } : s),
    }));
    addAudit('Hapus', 'Distribusi', `Hapus distribusi ${rec.qty} unit`);
    toast('success', 'Transaksi dihapus & stok dikembalikan');
    setDelId(null);
  };

  const columns: Column<BarangKeluar>[] = [
    { key: 'tanggal', label: 'Tanggal', sortValue: (r) => r.tanggal, render: (r) => <span className="text-slate-600 text-sm flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(r.tanggal)}</span> },
    { key: 'dapur', label: 'Dapur Tujuan', render: (r) => { const d = db.dapur.find((x) => x.id === r.id_dapur); return <span className="text-sm text-slate-700 flex items-center gap-1.5"><ChefHat className="h-3.5 w-3.5 text-slate-400" />{d?.nama_dapur ?? '-'}</span>; } },
    { key: 'barang', label: 'Barang', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-medium text-slate-700">{b?.nama_barang ?? '-'}</span>; } },
    { key: 'qty', label: 'Qty Keluar', align: 'right', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-semibold text-slate-800">{formatNumber(r.qty)} {b?.satuan}</span>; } },
    { key: 'aksi', label: '', align: 'center', render: (r) => <button onClick={() => setDelId(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button> },
  ];

  return (
    <div>
      <PageHeader title="Distribusi Barang ke Dapur" subtitle="Pengiriman barang dari gudang ke dapur" actions={
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
          <Plus className="h-4 w-4" /> Distribusi Baru
        </button>
      } />

      <DataTable columns={columns} rows={db.barang_keluar} rowKey={(r) => r.id} searchKeys={['tanggal']} searchPlaceholder="Cari tanggal..." pageSize={10} />

      <Modal open={open} onClose={() => setOpen(false)} title="Distribusi Barang ke Dapur" footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Distribusikan</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Dapur Tujuan</label>
            <select value={form.id_dapur} onChange={(e) => setForm({ ...form, id_dapur: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
              <option value={0}>-- Pilih Dapur --</option>
              {db.dapur.map((d) => <option key={d.id} value={d.id}>{d.nama_dapur}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Barang</label>
            <select value={form.id_barang} onChange={(e) => setForm({ ...form, id_barang: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
              <option value={0}>-- Pilih Barang --</option>
              {db.barang.map((b) => { const st = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0; return <option key={b.id} value={b.id}>{b.nama_barang} — stok gudang: {st} {b.satuan}</option>; })}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Qty Keluar</label>
            <input type="number" min={1} max={availableStok} value={form.qty || ''} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          {form.id_barang > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700"><Package className="h-5 w-5" /><span className="text-sm font-medium">Stok Gudang Tersedia</span></div>
              <span className="text-lg font-bold text-emerald-700">{formatNumber(availableStok)}</span>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Distribusi" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><ArrowUpFromLine className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Hapus transaksi distribusi? Stok gudang & dapur akan dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
