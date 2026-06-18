import { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { StockBadge } from '../components/StockBadge';
import { nextId } from '../lib/db';
import { stockStatus } from '../lib/utils';
import type { Barang } from '../lib/types';
import { formatNumber } from '../lib/utils';

const empty: Omit<Barang, 'id'> = { kode_barang: '', nama_barang: '', satuan: 'Kg', stok_minimum: 0 };

export function BarangPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [delId, setDelId] = useState<number | null>(null);

  if (!db) return null;

  const openAdd = () => { setForm({ ...empty, kode_barang: `BRG-${String(db.barang.length + 1).padStart(3, '0')}` }); setEditId(null); setOpen(true); };
  const openEdit = (b: Barang) => { setForm(b); setEditId(b.id); setOpen(true); };

  const save = () => {
    if (!form.kode_barang || !form.nama_barang || !form.satuan) { toast('warning', 'Lengkapi semua field'); return; }
    if (form.stok_minimum < 0) { toast('warning', 'Stok minimum tidak valid'); return; }
    if (editId) {
      setDb((d) => ({ ...d, barang: d.barang.map((b) => b.id === editId ? { ...form, id: editId } : b) }));
      addAudit('Edit', 'Data Barang', `Ubah barang ${form.nama_barang}`);
      toast('success', 'Data barang diperbarui');
    } else {
      const id = nextId(db.barang);
      setDb((d) => ({ ...d, barang: [...d.barang, { ...form, id }], stok: [...d.stok, { id_barang: id, stok_gudang: 0 }] }));
      addAudit('Tambah', 'Data Barang', `Tambah barang ${form.nama_barang}`);
      toast('success', 'Barang baru ditambahkan');
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!delId) return;
    const b = db.barang.find((x) => x.id === delId);
    setDb((d) => ({ ...d, barang: d.barang.filter((x) => x.id !== delId), stok: d.stok.filter((x) => x.id_barang !== delId), stok_dapur: d.stok_dapur.filter((x) => x.id_barang !== delId) }));
    addAudit('Hapus', 'Data Barang', `Hapus barang ${b?.nama_barang ?? ''}`);
    toast('success', 'Barang dihapus');
    setDelId(null);
  };

  const columns: Column<Barang>[] = [
    { key: 'kode_barang', label: 'Kode', render: (b) => <span className="font-mono text-xs font-medium text-blue-600">{b.kode_barang}</span> },
    { key: 'nama_barang', label: 'Nama Barang', render: (b) => <span className="font-medium text-slate-700">{b.nama_barang}</span> },
    { key: 'satuan', label: 'Satuan' },
    { key: 'stok_minimum', label: 'Stok Min', align: 'right', render: (b) => formatNumber(b.stok_minimum) },
    { key: 'stok', label: 'Stok Gudang', align: 'right', sortValue: (b) => db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0, render: (b) => {
      const stok = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0;
      return <span className="font-semibold text-slate-700">{formatNumber(stok)} {b.satuan}</span>;
    } },
    { key: 'status', label: 'Status', align: 'center', sortValue: (b) => stockStatus(db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0, b), render: (b) => {
      const stok = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0;
      return <StockBadge status={stockStatus(stok, b)} />;
    } },
    { key: 'aksi', label: 'Aksi', align: 'center', render: (b) => (
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setDelId(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Data Barang" subtitle="Master data bahan baku gudang" actions={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
          <Plus className="h-4 w-4" /> Tambah Barang
        </button>
      } />

      <DataTable columns={columns} rows={db.barang} rowKey={(b) => b.id} searchKeys={['kode_barang', 'nama_barang', 'satuan']} searchPlaceholder="Cari kode / nama barang..." />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Barang' : 'Tambah Barang'} footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Kode Barang</label>
            <input value={form.kode_barang} onChange={(e) => setForm({ ...form, kode_barang: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nama Barang</label>
            <input value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Satuan</label>
              <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
                {['Kg', 'Liter', 'Pack', 'Pcs', 'Box', 'Karung', 'Ikat'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Stok Minimum</label>
              <input type="number" min={0} value={form.stok_minimum} onChange={(e) => setForm({ ...form, stok_minimum: Number(e.target.value) })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Barang" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Package className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus barang <span className="font-semibold text-slate-800">{db.barang.find((b) => b.id === delId)?.nama_barang}</span>? Stok terkait juga akan dihapus.</p>
        </div>
      </Modal>
    </div>
  );
}
