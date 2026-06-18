import { useState } from 'react';
import { Plus, Pencil, Trash2, ChefHat, Boxes } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { nextId } from '../lib/db';
import { formatNumber } from '../lib/utils';
import type { Dapur } from '../lib/types';

export function DapurPage() {
  const { db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [delId, setDelId] = useState<number | null>(null);

  if (!db) return null;

  const openAdd = () => { setNama(''); setEditId(null); setOpen(true); };
  const openEdit = (d: Dapur) => { setNama(d.nama_dapur); setEditId(d.id); setOpen(true); };

  const save = () => {
    if (!nama.trim()) { toast('warning', 'Nama dapur wajib diisi'); return; }
    if (editId) {
      setDb((d) => ({ ...d, dapur: d.dapur.map((x) => x.id === editId ? { nama_dapur: nama, id: editId } : x) }));
      addAudit('Edit', 'Data Dapur', `Ubah dapur ${nama}`);
      toast('success', 'Dapur diperbarui');
    } else {
      setDb((d) => ({ ...d, dapur: [...d.dapur, { nama_dapur: nama, id: nextId(db.dapur) }] }));
      addAudit('Tambah', 'Data Dapur', `Tambah dapur ${nama}`);
      toast('success', 'Dapur ditambahkan');
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!delId) return;
    const d = db.dapur.find((x) => x.id === delId);
    setDb((s) => ({ ...s, dapur: s.dapur.filter((x) => x.id !== delId), stok_dapur: s.stok_dapur.filter((x) => x.id_dapur !== delId) }));
    addAudit('Hapus', 'Data Dapur', `Hapus dapur ${d?.nama_dapur ?? ''}`);
    toast('success', 'Dapur dihapus');
    setDelId(null);
  };

  return (
    <div>
      <PageHeader title="Data Dapur" subtitle="Daftar dapur tujuan distribusi" actions={
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-600/30 transition-colors">
          <Plus className="h-4 w-4" /> Tambah Dapur
        </button>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.dapur.map((d) => {
          const stokList = db.stok_dapur.filter((s) => s.id_dapur === d.id);
          const total = stokList.reduce((a, s) => a + s.qty, 0);
          return (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/30">
                    {d.nama_dapur.split(' ')[1] ?? d.nama_dapur.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{d.nama_dapur}</h3>
                    <p className="text-xs text-slate-400">{stokList.length} jenis bahan</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDelId(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500"><Boxes className="h-4 w-4" /><span className="text-xs">Total stok</span></div>
                <span className="text-xl font-bold text-slate-800">{formatNumber(total)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Dapur' : 'Tambah Dapur'} size="sm" footer={
        <>
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Simpan</button>
        </>
      }>
        <div>
          <label className="text-sm font-medium text-slate-700">Nama Dapur</label>
          <div className="relative mt-1.5">
            <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Dapur D" className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>
      </Modal>

      <Modal open={delId !== null} onClose={() => setDelId(null)} title="Hapus Dapur" size="sm" footer={
        <>
          <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Hapus</button>
        </>
      }>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0"><ChefHat className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-slate-600">Yakin ingin menghapus <span className="font-semibold text-slate-800">{db.dapur.find((d) => d.id === delId)?.nama_dapur}</span>? Stok dapur terkait juga akan dihapus.</p>
        </div>
      </Modal>
    </div>
  );
}
