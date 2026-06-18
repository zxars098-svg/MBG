import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Warehouse, AlertTriangle, ArrowUpFromLine, Truck, TrendingUp, Boxes, ChefHat } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { useAuth } from '../lib/auth';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { StockBadge } from '../components/StockBadge';
import { formatNumber, stockStatus, todayISO } from '../lib/utils';

export function Dashboard() {
  const { db } = useAuth();

  const stats = useMemo(() => {
    if (!db) return null;
    const totalBarang = db.barang.length;
    const totalStok = db.stok.reduce((s, x) => s + x.stok_gudang, 0);
    const lowStock = db.barang.filter((b) => {
      const st = db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0;
      return st <= b.stok_minimum;
    }).length;
    const today = todayISO();
    const distToday = db.barang_keluar.filter((k) => k.tanggal === today).length;
    const totalSupplier = db.supplier.length;
    return { totalBarang, totalStok, lowStock, distToday, totalSupplier };
  }, [db]);

  const distPerDay = useMemo(() => {
    if (!db) return [];
    const days: { label: string; distribusi: number; masuk: number; pemakaian: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' });
      days.push({
        label,
        distribusi: db.barang_keluar.filter((k) => k.tanggal === iso).reduce((s, k) => s + k.qty, 0),
        masuk: db.barang_masuk.filter((k) => k.tanggal === iso).reduce((s, k) => s + k.qty, 0),
        pemakaian: db.pemakaian_dapur.filter((k) => k.tanggal === iso).reduce((s, k) => s + k.qty, 0),
      });
    }
    return days;
  }, [db]);

  const stokTrend = useMemo(() => {
    if (!db) return [];
    return db.barang.slice(0, 8).map((b) => ({
      name: b.nama_barang.length > 10 ? b.nama_barang.slice(0, 10) + '…' : b.nama_barang,
      gudang: db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0,
      dapur: db.stok_dapur.filter((s) => s.id_barang === b.id).reduce((a, s) => a + s.qty, 0),
    }));
  }, [db]);

  const topKeluar = useMemo(() => {
    if (!db) return [];
    const map = new Map<number, number>();
    db.barang_keluar.forEach((k) => map.set(k.id_barang, (map.get(k.id_barang) ?? 0) + k.qty));
    db.pemakaian_dapur.forEach((k) => map.set(k.id_barang, (map.get(k.id_barang) ?? 0) + k.qty));
    return [...map.entries()]
      .map(([id, qty]) => ({ barang: db.barang.find((b) => b.id === id), qty }))
      .filter((x) => x.barang)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [db]);

  const dapurSummary = useMemo(() => {
    if (!db) return [];
    return db.dapur.map((d) => {
      const total = db.stok_dapur.filter((s) => s.id_dapur === d.id).reduce((a, s) => a + s.qty, 0);
      const items = db.stok_dapur.filter((s) => s.id_dapur === d.id).length;
      return { dapur: d, total, items };
    });
  }, [db]);

  const lowStockList = useMemo(() => {
    if (!db) return [];
    return db.barang
      .map((b) => ({ b, stok: db.stok.find((s) => s.id_barang === b.id)?.stok_gudang ?? 0 }))
      .filter((x) => x.stok <= x.b.stok_minimum)
      .sort((a, b) => a.stok - b.stok);
  }, [db]);

  if (!db || !stats) return null;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan stok & aktivitas gudang hari ini" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard index={0} label="Total Barang" value={stats.totalBarang} icon={Package} accent="blue" sub="Jenis bahan" />
        <StatCard index={1} label="Total Stok Gudang" value={formatNumber(stats.totalStok)} icon={Warehouse} accent="green" sub="Seluruh satuan" />
        <StatCard index={2} label="Barang Hampir Habis" value={stats.lowStock} icon={AlertTriangle} accent="amber" sub="Perlu restock" />
        <StatCard index={3} label="Distribusi Hari Ini" value={stats.distToday} icon={ArrowUpFromLine} accent="red" sub="Transaksi keluar" />
        <StatCard index={4} label="Total Supplier" value={stats.totalSupplier} icon={Truck} accent="slate" sub="Supplier aktif" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Aktivitas 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-400">Barang masuk, distribusi & pemakaian</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distPerDay} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="masuk" name="Masuk" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="distribusi" name="Distribusi" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="pemakaian" name="Pemakaian" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Notifikasi Stok Minimum</h3>
              <p className="text-xs text-slate-400">{lowStockList.length} barang perlu perhatian</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {lowStockList.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">
                <Boxes className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                Semua stok aman
              </div>
            ) : lowStockList.map((x) => (
              <div key={x.b.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{x.b.nama_barang}</p>
                  <p className="text-[11px] text-slate-400">Min: {x.b.stok_minimum} {x.b.satuan}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-700">{formatNumber(x.stok)} {x.b.satuan}</p>
                  <StockBadge status={stockStatus(x.stok, x.b)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Grafik Stok Realtime</h3>
              <p className="text-xs text-slate-400">Perbandingan stok gudang vs dapur</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center"><Warehouse className="h-4 w-4 text-emerald-600" /></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stokTrend}>
              <defs>
                <linearGradient id="gGudang" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDapur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="gudang" name="Gudang" stroke="#2563EB" strokeWidth={2} fill="url(#gGudang)" />
              <Area type="monotone" dataKey="dapur" name="Dapur" stroke="#16A34A" strokeWidth={2} fill="url(#gDapur)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Ringkasan Stok per Dapur</h3>
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center"><ChefHat className="h-4 w-4 text-blue-600" /></div>
          </div>
          <div className="space-y-3">
            {dapurSummary.map((d) => (
              <Link to="/laporan/stok-dapur" key={d.dapur.id} className="block p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/30">
                      {d.dapur.nama_dapur.split(' ')[1]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{d.dapur.nama_dapur}</p>
                      <p className="text-[11px] text-slate-400">{d.items} jenis bahan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-800">{formatNumber(d.total)}</p>
                    <p className="text-[10px] text-slate-400">total stok</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Top 10 Barang Paling Sering Keluar</h3>
            <p className="text-xs text-slate-400">Berdasarkan total distribusi & pemakaian</p>
          </div>
          <Link to="/kartu-stok" className="text-xs font-medium text-blue-600 hover:text-blue-700">Lihat semua →</Link>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topKeluar.map((x) => ({ name: x.barang!.nama_barang.length > 12 ? x.barang!.nama_barang.slice(0, 12) + '…' : x.barang!.nama_barang, qty: x.qty }))} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="qty" name="Qty Keluar" fill="#2563EB" radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
