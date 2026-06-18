import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast('warning', 'Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      toast('success', 'Login berhasil. Selamat datang!');
      navigate('/');
    } else {
      toast('error', 'Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: "url('/BGN_LOGO.png')",
          backgroundSize: 'min(80vw, 900px)',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          width: '100%',
          height: '100%',
          filter: 'brightness(0.75) contrast(1.05)',
        }}
      />
      <div className="absolute inset-0 bg-slate-950/10" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Gudang MBG</h1>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Manajemen Bahan Dapur</p>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-8 shadow-lg shadow-slate-200/80">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-sm text-slate-600 mb-6">Kelola stok bahan dapur 3 unit dengan efisien dan real-time.</p>
            <p className="text-sm text-blue-700 font-medium italic mb-8">Orang yang terbiasa kenyang tidak pernah tahu rasanya kelaparan.</p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Username</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white border border-slate-200 rounded text-blue-600 cursor-pointer"
                />
                Ingat saya
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">Solusi manajemen gudang untuk Mbg Catering © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
