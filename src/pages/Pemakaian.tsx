import { useState } from 'react';
import { Plus, Trash2, Flame, Calendar, ChefHat } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { nextId } from '../lib/db';
import { formatDate, todayISO, formatNumber } from '../lib/utils';
import type { PemakaianDapur } from '../lib/types';

export function PemakaianPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ tanggal: todayISO(), id_dapur: 0, id_barang: 0, qty: 0 });

  if (!db) return null;

  const dapurStok = form.id_dapur && form.id_barang ? (db.stok_dapur.find((s) => s.id_dapur === form.id_dapur && s.id_barang === form.id_barang)?.qty ?? 0) : 0;

  const save = () => {
    if (!form.tanggal || !form.id_dapur || !form.id_barang) { toast('warning', 'Lengkapi semua field'); return; }
    if (form.qty <= 0) { toast('warning', 'Qty harus lebih dari 0'); return; }
    if (form.qty > dapurStok) { toast('error', `Stok dapur tidak cukup. Tersedia: ${dapurStok}`); return; }
    const id = nextId(db.pemakaian_dapur);
    const rec: PemakaianDapur = { id, tanggal: form.tanggal, id_dapur: form.id_dapur, id_barang: form.id_barang, qty: form.qty };
    const barang = db.barang.find((b) => b.id === form.id_barang)!;
    const dapur = db.dapur.find((d) => d.id === form.id_dapur)!;
    setDb((d) => ({
      ...d,
      pemakaian_dapur: [...d.pemakaian_dapur, rec],
      stok_dapur: d.stok_dapur.map((s) => s.id_dapur === form.id_dapur && s.id_barang === form.id_barang ? { ...s, qty: s.qty - form.qty } : s),
      histori: [...d.histori, { id: nextId(d.histori), tanggal: form.tanggal, jenis_transaksi: 'Pemakaian', id_barang: form.id_barang, qty: form.qty, keterangan: `Pemakaian ${dapur.nama_dapur}` }],
    }));
    addAudit('Tambah', 'Pemakaian Dapur', `Pemakaian ${form.qty} ${barang.satuan} ${barang.nama_barang} (${dapur.nama_dapur})`);
    toast('success', `Pemakaian ${form.qty} ${barang.satuan} ${barang.nama_barang} dicatat`);
    setOpen(false);
    setForm({ tanggal: todayISO(), id_dapur: 0, id_barang: 0, qty: 0 });
  };

  const confirmDelete = () => {
    if (!delId) return;
    const rec = db.pemakaian_dapur.find((x) => x.id === delId);
    if (!rec) return;
    setDb((d) => ({
      ...d,
      pemakaian_dapur: d.pemakaian_dapur.filter((x) => x.id !== delId),
      stok_dapur: d.stok_dapur.map((s) => s.id_dapur === rec.id_dapur && s.id_barang === rec.id_barang ? { ...s, qty: s.qty + rec.qty } : s),
    }));
    addAudit('Hapus', 'Pemakaian Dapur', `Hapus pemakaian ${rec.qty} unit`);
    toast('success', 'Transaksi dihapus & stok dapur dikembalikan');
    setDelId(null);
  };

  const columns: Column<PemakaianDapur>[] = [
    { key: 'tanggal', label: 'Tanggal', sortValue: (r) => r.tanggal, render: (r) => <span className="text-slate-600 text-sm flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(r.tanggal)}</span> },
    { key: 'dapur', label: 'Dapur', render: (r) => { const d = db.dapur.find((x) => x.id === r.id_dapur); return <span className="text-sm text-slate-700 flex items-center gap-1.5"><ChefHat className="h-3.5 w-3.5 text-slate-400" />{d?.nama_dapur ?? '-'}</span>; } },
    { key: 'barang', label: 'Barang', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-medium text-slate-700">{b?.nama_barang ?? '-'}</span>; } },
    { key: 'qty', label: 'Qty Pemakaian', align: 'right', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-semibold text-amber-700">{formatNumber(r.qty)} {b?.satuan}</span>; } },
    { key: 'aksi', label: '', align: 'center', render: (r) => <button onClick={() => setDelId(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button> },
  ];

  return (
    <div>
      <PageHeader title="Pemakaian Dapur" subtitle="Pencatatan pemakaian bahan di setiap dapur" actions={
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
          <Plus className="h-4 w-4" /> Catat Pemakaian
        </button>
      } />

      <DataTable columns={columns} rows={db.pemakaian_dapur} rowKey={(r) => r.id} searchKeys={['tanggal']} searchPlaceholder="Cari tanggal..." pageSize={10} />

      <Modal open={open} onClose={() => setOpen(false)} title="Catat Pemakaian Dapur" footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Dapur</label>
            <select value={form.id_dapur} onChange={(e) => setForm({ ...form, id_dapur: Number(e.target.value), id_barang: 0, qty: 0 })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
              <option value={0}>-- Pilih Dapur --</option>
              {db.dapur.map((d) => <option key={d.id} value={d.id}>{d.nama_dapur}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Barang</label>
            <select value={form.id_barang} onChange={(e) => setForm({ ...form, id_barang: Number(e.target.value), qty: 0 })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white" disabled={!form.id_dapur}>
              <option value={0}>-- Pilih Barang --</option>
              {form.id_dapur > 0 && db.stok_dapur.filter((s) => s.id_dapur === form.id_dapur && s.qty > 0).map((s) => { const b = db.barang.find((x) => x.id === s.id_barang)!; return <option key={b.id} value={b.id}>{b.nama_barang} — stok dapur: {s.qty} {b.satuan}</option>; })}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Qty Pemakaian</label>
            <input type="number" min={1} max={dapurStok} value={form.qty || ''} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          {form.id_barang > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700"><Flame className="h-5 w-5" /><span className="text-sm font-medium">Stok Dapur Saat Ini</span></div>
              <span className="text-lg font-bold text-amber-700">{formatNumber(dapurStok)}</span>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Pemakaian" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Flame className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Hapus catatan pemakaian? Stok dapur akan dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
