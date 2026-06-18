import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem { id: number; type: ToastType; message: string; }
interface ToastCtx { toast: (type: ToastType, message: string) => void; }
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, type, message }]);
    setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 3800);
  }, []);

  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  const styles = {
    success: 'border-emerald-200 bg-white text-emerald-700',
    error: 'border-red-200 bg-white text-red-700',
    warning: 'border-amber-200 bg-white text-amber-700',
    info: 'border-blue-200 bg-white text-blue-700',
  };
  const iconColor = { success: 'text-emerald-500', error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500' };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2.5rem)]">
        {items.map((i) => {
          const Icon = icons[i.type];
          return (
            <div key={i.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5 ${styles[i.type]} animate-[slideIn_.25s_ease]`}>
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor[i.type]}`} />
              <p className="text-sm font-medium flex-1 leading-snug">{i.message}</p>
              <button onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used within ToastProvider');
  return c.toast;
}
