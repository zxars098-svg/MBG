import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Warehouse } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-slate-400">Memuat sistem...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
