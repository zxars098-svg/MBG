import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, ChefHat, ArrowDownToLine, ArrowUpFromLine,
  Flame, ClipboardList, History, ShieldCheck, FileBarChart, Warehouse,
  LogOut, Menu, X, Bell, ChevronDown, Search, Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from './Toast';

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; group: string; }

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Utama' },
  { to: '/barang', label: 'Data Barang', icon: Package, group: 'Master Data' },
  { to: '/supplier', label: 'Data Supplier', icon: Truck, group: 'Master Data' },
  { to: '/dapur', label: 'Data Dapur', icon: ChefHat, group: 'Master Data' },
  { to: '/barang-masuk', label: 'Barang Masuk', icon: ArrowDownToLine, group: 'Transaksi' },
  { to: '/distribusi', label: 'Distribusi Dapur', icon: ArrowUpFromLine, group: 'Transaksi' },
  { to: '/pemakaian', label: 'Pemakaian Dapur', icon: Flame, group: 'Transaksi' },
  { to: '/kartu-stok', label: 'Kartu Stok', icon: ClipboardList, group: 'Stok' },
  { to: '/histori', label: 'Histori Transaksi', icon: History, group: 'Stok' },
  { to: '/audit', label: 'Audit Log', icon: ShieldCheck, group: 'Stok' },
  { to: '/laporan/masuk', label: 'Lap. Barang Masuk', icon: FileBarChart, group: 'Laporan' },
  { to: '/laporan/distribusi', label: 'Lap. Distribusi', icon: FileBarChart, group: 'Laporan' },
  { to: '/laporan/stok-gudang', label: 'Lap. Stok Gudang', icon: Warehouse, group: 'Laporan' },
  { to: '/laporan/stok-dapur', label: 'Lap. Stok Dapur', icon: ChefHat, group: 'Laporan' },
  { to: '/users', label: 'Manajemen User', icon: Users, group: 'Pengaturan' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, db } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const lowStockItems = (() => {
    if (!db) return [];
    return db.barang
      .map((b) => {
        const s = db.stok.find((x) => x.id_barang === b.id);
        const stok = s?.stok_gudang ?? 0;
        return { barang: b, stok };
      })
      .filter((x) => x.stok <= x.barang.stok_minimum)
      .sort((a, b) => a.stok - b.stok);
  })();

  const handleLogout = () => {
    logout();
    toast('info', 'Anda telah keluar dari sistem');
    navigate('/login');
  };

  const groups = [...new Set(nav.map((n) => n.group))];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/70 flex flex-col z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm shadow-blue-600/30">
            <Warehouse className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-[15px]">Gudang MBG</p>
            <p className="text-[11px] text-slate-400">Inventory System</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {groups.map((g) => (
            <div key={g}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g}</p>
              <div className="space-y-0.5">
                {nav.filter((n) => n.group === g && (n.to !== '/users' || user?.role === 'admin')).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
                      }`
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
              {user?.nama?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.nama}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Keluar">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200/70 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input placeholder="Cari menu, barang..." className="w-56 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <Bell className="h-5 w-5" />
                {lowStockItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{lowStockItems.length}</span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div onClick={() => setNotifOpen(false)} className="fixed inset-0 z-30" />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-700">Notifikasi Stok</p>
                      <span className="text-xs text-slate-400">{lowStockItems.length} item</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {lowStockItems.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400">Semua stok aman</p>
                      ) : lowStockItems.map((x) => (
                        <div key={x.barang.id} className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{x.barang.nama_barang}</p>
                            <p className="text-[11px] text-slate-400">{x.barang.kode_barang}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${x.stok <= x.barang.stok_minimum * 0.5 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {x.stok} {x.barang.satuan}
                          </span>
                        </div>
                      ))}
                    </div>
                    <NavLink to="/kartu-stok" onClick={() => setNotifOpen(false)} className="block px-4 py-2.5 text-center text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-slate-100">
                      Lihat Kartu Stok
                    </NavLink>
                  </div>
                </>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                {user?.nama?.charAt(0) ?? 'A'}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
