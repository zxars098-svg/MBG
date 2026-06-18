import { useState, type FormEvent } from 'react';
import bcrypt from 'bcryptjs';
import { useAuth } from '../lib/auth';
import { nextId } from '../lib/db';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import type { Role } from '../lib/types';

export function UserManagementPage() {
  const { user, db, setDb, addAudit } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<Role>('gudang');
  const [saving, setSaving] = useState(false);

  if (!db) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm text-slate-500">Memuat data pengguna...</div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center text-slate-700 shadow-sm">
          <p className="text-lg font-semibold mb-2">Akses terbatas</p>
          <p className="text-sm text-slate-500">Hanya administrator yang dapat mengelola akun pengguna.</p>
        </div>
      </div>
    );
  }

  const handleAddUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password.trim() || !nama.trim()) {
      toast('warning', 'Lengkapi semua field terlebih dahulu.');
      return;
    }
    if (db.users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      toast('error', 'Username sudah terdaftar.');
      return;
    }

    setSaving(true);
    const passwordHash = await bcrypt.hash(password.trim(), 10);
    setDb((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        users: [
          ...prev.users,
          {
            id: nextId(prev.users),
            username: username.trim(),
            password: passwordHash,
            nama: nama.trim(),
            role,
          },
        ],
      };
      return next;
    });
    addAudit(`Tambah user`, 'Auth', `Tambah user ${username.trim()} (${role})`);
    setUsername('');
    setPassword('');
    setNama('');
    setRole('gudang');
    setSaving(false);
    toast('success', 'User baru berhasil ditambahkan.');
  };

  const handleDeleteUser = (id: number, usernameToDelete: string) => {
    if (id === user.id) {
      toast('error', 'Tidak bisa menghapus akun yang sedang aktif.');
      return;
    }

    setDb((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
      };
      return next;
    });
    addAudit(`Hapus user`, 'Auth', `Hapus user ${usernameToDelete}`);
    toast('success', `User ${usernameToDelete} berhasil dihapus.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen User"
        subtitle="Tambah dan hapus akun pengguna agar kontrol akses tetap terjaga."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Daftar Pengguna</h2>
              <p className="text-sm text-slate-500">Lihat semua username, role, dan hapus akun jika diperlukan.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">ID</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Username</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Nama</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {db.users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-slate-700">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                    <td className="px-4 py-3 text-slate-600">{u.nama}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
                        disabled={u.id === user.id}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Tambah User Baru</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: userbaru"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="admin">Admin</option>
                <option value="gudang">Gudang</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Tambah User'}
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-semibold mb-2">Catatan</p>
            <p className="text-slate-600">Password disimpan secara terenkripsi dan tidak ditampilkan kembali. Jika ingin mengganti password, hapus dan buat akun baru atau lakukan perubahan via kode.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
