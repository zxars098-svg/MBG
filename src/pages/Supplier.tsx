import { useState } from 'react';
import { Plus, Pencil, Trash2, Truck, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { nextId } from '../lib/db';
import type { Supplier } from '../lib/types';

const empty: Omit<Supplier, 'id'> = { nama_supplier: '', alamat: '', no_hp: '' };

export function SupplierPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [delId, setDelId] = useState<number | null>(null);

  if (!db) return null;

  const openAdd = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (s: Supplier) => { setForm(s); setEditId(s.id); setOpen(true); };

  const save = () => {
    if (!form.nama_supplier || !form.alamat || !form.no_hp) { toast('warning', 'Lengkapi semua field'); return; }
    if (editId) {
      setDb((d) => ({ ...d, supplier: d.supplier.map((s) => s.id === editId ? { ...form, id: editId } : s) }));
      addAudit('Edit', 'Data Supplier', `Ubah supplier ${form.nama_supplier}`);
      toast('success', 'Supplier diperbarui');
    } else {
      setDb((d) => ({ ...d, supplier: [...d.supplier, { ...form, id: nextId(db.supplier) }] }));
      addAudit('Tambah', 'Data Supplier', `Tambah supplier ${form.nama_supplier}`);
      toast('success', 'Supplier ditambahkan');
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!delId) return;
    const s = db.supplier.find((x) => x.id === delId);
    setDb((d) => ({ ...d, supplier: d.supplier.filter((x) => x.id !== delId) }));
    addAudit('Hapus', 'Data Supplier', `Hapus supplier ${s?.nama_supplier ?? ''}`);
    toast('success', 'Supplier dihapus');
    setDelId(null);
  };

  const columns: Column<Supplier>[] = [
    { key: 'nama_supplier', label: 'Nama Supplier', render: (s) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Truck className="h-4 w-4 text-blue-600" /></div>
        <span className="font-medium text-slate-700">{s.nama_supplier}</span>
      </div>
    ) },
    { key: 'alamat', label: 'Alamat', render: (s) => <span className="text-slate-600 text-sm flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />{s.alamat}</span> },
    { key: 'no_hp', label: 'No. HP', render: (s) => <span className="text-slate-600 text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{s.no_hp}</span> },
    { key: 'aksi', label: 'Aksi', align: 'center', render: (s) => (
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setDelId(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Data Supplier" subtitle="Daftar supplier bahan baku" actions={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
          <Plus className="h-4 w-4" /> Tambah Supplier
        </button>
      } />

      <DataTable columns={columns} rows={db.supplier} rowKey={(s) => s.id} searchKeys={['nama_supplier', 'alamat', 'no_hp']} searchPlaceholder="Cari supplier..." />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Supplier' : 'Tambah Supplier'} footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Nama Supplier</label>
            <input value={form.nama_supplier} onChange={(e) => setForm({ ...form, nama_supplier: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Alamat</label>
            <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={2} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">No. HP</label>
            <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Supplier" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Truck className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus supplier <span className="font-semibold text-slate-800">{db.supplier.find((s) => s.id === delId)?.nama_supplier}</span>?</p>
        </div>
      </Modal>
    </div>
  );
}
