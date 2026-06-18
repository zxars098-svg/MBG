import { useState } from 'react';
import { Plus, Trash2, ArrowDownToLine, Calendar, Truck, Package } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { nextId } from '../lib/db';
import { formatDate, formatRupiah, todayISO, formatNumber } from '../lib/utils';
import type { BarangMasuk } from '../lib/types';

export function BarangMasukPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ tanggal: todayISO(), id_supplier: 0, id_barang: 0, qty: 0, harga: 0 });

  if (!db) return null;

  const subtotal = form.qty * form.harga;

  const save = () => {
    if (!form.tanggal || !form.id_supplier || !form.id_barang) { toast('warning', 'Lengkapi semua field'); return; }
    if (form.qty <= 0) { toast('warning', 'Qty harus lebih dari 0'); return; }
    if (form.harga < 0) { toast('warning', 'Harga tidak valid'); return; }
    const id = nextId(db.barang_masuk);
    const rec: BarangMasuk = { id, tanggal: form.tanggal, id_supplier: form.id_supplier, id_barang: form.id_barang, qty: form.qty, harga: form.harga, subtotal };
    const barang = db.barang.find((b) => b.id === form.id_barang)!;
    const supplier = db.supplier.find((s) => s.id === form.id_supplier)!;
    setDb((d) => ({
      ...d,
      barang_masuk: [...d.barang_masuk, rec],
      stok: d.stok.map((s) => s.id_barang === form.id_barang ? { ...s, stok_gudang: s.stok_gudang + form.qty } : s),
      histori: [...d.histori, { id: nextId(d.histori), tanggal: form.tanggal, jenis_transaksi: 'Barang Masuk', id_barang: form.id_barang, qty: form.qty, keterangan: `Pembelian dari ${supplier.nama_supplier}` }],
    }));
    addAudit('Tambah', 'Barang Masuk', `Input ${form.qty} ${barang.satuan} ${barang.nama_barang}`);
    toast('success', `Stok gudang ${barang.nama_barang} bertambah ${form.qty} ${barang.satuan}`);
    setOpen(false);
    setForm({ tanggal: todayISO(), id_supplier: 0, id_barang: 0, qty: 0, harga: 0 });
  };

  const confirmDelete = () => {
    if (!delId) return;
    const rec = db.barang_masuk.find((x) => x.id === delId);
    if (!rec) return;
    setDb((d) => ({
      ...d,
      barang_masuk: d.barang_masuk.filter((x) => x.id !== delId),
      stok: d.stok.map((s) => s.id_barang === rec.id_barang ? { ...s, stok_gudang: Math.max(0, s.stok_gudang - rec.qty) } : s),
    }));
    addAudit('Hapus', 'Barang Masuk', `Hapus transaksi masuk ${rec.qty} unit`);
    toast('success', 'Transaksi dihapus & stok dikurangi');
    setDelId(null);
  };

  const columns: Column<BarangMasuk>[] = [
    { key: 'tanggal', label: 'Tanggal', sortValue: (r) => r.tanggal, render: (r) => <span className="text-slate-600 text-sm flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(r.tanggal)}</span> },
    { key: 'supplier', label: 'Supplier', render: (r) => { const s = db.supplier.find((x) => x.id === r.id_supplier); return <span className="text-sm text-slate-700 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-slate-400" />{s?.nama_supplier ?? '-'}</span>; } },
    { key: 'barang', label: 'Barang', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-medium text-slate-700">{b?.nama_barang ?? '-'}</span>; } },
    { key: 'qty', label: 'Qty', align: 'right', render: (r) => { const b = db.barang.find((x) => x.id === r.id_barang); return <span className="font-medium text-slate-700">{formatNumber(r.qty)} {b?.satuan}</span>; } },
    { key: 'harga', label: 'Harga', align: 'right', sortValue: (r) => r.harga, render: (r) => <span className="text-slate-600 text-sm">{formatRupiah(r.harga)}</span> },
    { key: 'subtotal', label: 'Subtotal', align: 'right', sortValue: (r) => r.subtotal, render: (r) => <span className="font-semibold text-slate-800">{formatRupiah(r.subtotal)}</span> },
    { key: 'aksi', label: '', align: 'center', render: (r) => <button onClick={() => setDelId(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button> },
  ];

  const totalBelanja = db.barang_masuk.reduce((s, r) => s + r.subtotal, 0);

  return (
    <div>
      <PageHeader title="Barang Masuk" subtitle="Pencatatan penerimaan barang dari supplier" actions={
        <>
          <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm">
            <span className="text-blue-600 font-medium">Total Belanja: </span>
            <span className="font-bold text-blue-700">{formatRupiah(totalBelanja)}</span>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
            <Plus className="h-4 w-4" /> Transaksi Baru
          </button>
        </>
      } />

      <DataTable columns={columns} rows={db.barang_masuk} rowKey={(r) => r.id} searchKeys={['tanggal']} searchPlaceholder="Cari tanggal (YYYY-MM-DD)..." pageSize={10} />

      <Modal open={open} onClose={() => setOpen(false)} title="Transaksi Barang Masuk" size="lg" footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan Transaksi</button>
        </>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Supplier</label>
              <select value={form.id_supplier} onChange={(e) => setForm({ ...form, id_supplier: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
                <option value={0}>-- Pilih Supplier --</option>
                {db.supplier.map((s) => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Barang</label>
            <select value={form.id_barang} onChange={(e) => setForm({ ...form, id_barang: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
              <option value={0}>-- Pilih Barang --</option>
              {db.barang.map((b) => { const st = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0; return <option key={b.id} value={b.id}>{b.nama_barang} ({b.kode_barang}) — stok: {st} {b.satuan}</option>; })}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Qty</label>
              <input type="number" min={1} value={form.qty || ''} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Harga Satuan (Rp)</label>
              <input type="number" min={0} value={form.harga || ''} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700"><Package className="h-5 w-5" /><span className="text-sm font-medium">Subtotal Otomatis</span></div>
            <span className="text-xl font-bold text-blue-700">{formatRupiah(subtotal)}</span>
          </div>
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Transaksi" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><ArrowDownToLine className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Hapus transaksi ini? Stok gudang akan dikurangi sesuai qty.</p>
        </div>
      </Modal>
    </div>
  );
}
