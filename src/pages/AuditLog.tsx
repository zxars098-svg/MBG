import { ShieldCheck, User, Activity } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { formatDateTime } from '../lib/utils';
import type { AuditLog } from '../lib/types';

export function AuditLogPage() {
  const { db } = useAuth();
  if (!db) return null;

  const rows = [...db.audit_log].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const aksiColor = (aksi: string) => {
    if (aksi.includes('Tambah') || aksi === 'Distribusi') return 'bg-emerald-50 text-emerald-700';
    if (aksi.includes('Edit')) return 'bg-blue-50 text-blue-700';
    if (aksi.includes('Hapus')) return 'bg-red-50 text-red-700';
    if (aksi === 'Login' || aksi === 'Logout') return 'bg-slate-100 text-slate-600';
    return 'bg-amber-50 text-amber-700';
  };

  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', label: 'Waktu', sortValue: (r) => r.timestamp, render: (r) => <span className="text-slate-600 text-sm">{formatDateTime(r.timestamp)}</span> },
    { key: 'username', label: 'User', render: (r) => <span className="text-sm text-slate-700 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" />{r.username}</span> },
    { key: 'aksi', label: 'Aksi', render: (r) => <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${aksiColor(r.aksi)}`}>{r.aksi}</span> },
    { key: 'modul', label: 'Modul', render: (r) => <span className="text-slate-600 text-sm flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-slate-400" />{r.modul}</span> },
    { key: 'detail', label: 'Detail', render: (r) => <span className="text-slate-500 text-sm">{r.detail}</span> },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Jejak aktivitas admin dalam sistem" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Aktivitas', value: db.audit_log.length, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
          { label: 'Login Hari Ini', value: db.audit_log.filter((a) => a.aksi === 'Login' && a.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, icon: User, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Transaksi', value: db.audit_log.filter((a) => ['Tambah', 'Distribusi'].includes(a.aksi)).length, icon: Activity, color: 'text-amber-600 bg-amber-50' },
          { label: 'Penghapusan', value: db.audit_log.filter((a) => a.aksi.includes('Hapus')).length, icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{s.value}</p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} searchKeys={['username', 'aksi', 'modul', 'detail']} searchPlaceholder="Cari aktivitas..." pageSize={12} />
    </div>
  );
}
