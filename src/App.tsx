import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BarangPage } from './pages/Barang';
import { SupplierPage } from './pages/Supplier';
import { DapurPage } from './pages/Dapur';
import { BarangMasukPage } from './pages/BarangMasuk';
import { DistribusiPage } from './pages/Distribusi';
import { PemakaianPage } from './pages/Pemakaian';
import { KartuStokPage } from './pages/KartuStok';
import { HistoriPage } from './pages/Histori';
import { AuditLogPage } from './pages/AuditLog';
import { UserManagementPage } from './pages/UserManagement';
import { LaporanBarangMasukPage } from './pages/LaporanBarangMasuk';
import { LaporanDistribusiPage } from './pages/LaporanDistribusi';
import { LaporanStokGudangPage } from './pages/LaporanStokGudang';
import { LaporanStokDapurPage } from './pages/LaporanStokDapur';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/barang" element={<ProtectedRoute><Layout><BarangPage /></Layout></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute><Layout><SupplierPage /></Layout></ProtectedRoute>} />
            <Route path="/dapur" element={<ProtectedRoute><Layout><DapurPage /></Layout></ProtectedRoute>} />
            <Route path="/barang-masuk" element={<ProtectedRoute><Layout><BarangMasukPage /></Layout></ProtectedRoute>} />
            <Route path="/distribusi" element={<ProtectedRoute><Layout><DistribusiPage /></Layout></ProtectedRoute>} />
            <Route path="/pemakaian" element={<ProtectedRoute><Layout><PemakaianPage /></Layout></ProtectedRoute>} />
            <Route path="/kartu-stok" element={<ProtectedRoute><Layout><KartuStokPage /></Layout></ProtectedRoute>} />
            <Route path="/histori" element={<ProtectedRoute><Layout><HistoriPage /></Layout></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><Layout><AuditLogPage /></Layout></ProtectedRoute>} />
            <Route path="/laporan/masuk" element={<ProtectedRoute><Layout><LaporanBarangMasukPage /></Layout></ProtectedRoute>} />
            <Route path="/laporan/distribusi" element={<ProtectedRoute><Layout><LaporanDistribusiPage /></Layout></ProtectedRoute>} />
            <Route path="/laporan/stok-gudang" element={<ProtectedRoute><Layout><LaporanStokGudangPage /></Layout></ProtectedRoute>} />
            <Route path="/laporan/stok-dapur" element={<ProtectedRoute><Layout><LaporanStokDapurPage /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Layout><UserManagementPage /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
