import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  sub?: string;
  index?: number;
}

const accents = {
  blue: { iconBg: 'bg-blue-50 text-blue-600', ring: 'ring-blue-100' },
  green: { iconBg: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-100' },
  amber: { iconBg: 'bg-amber-50 text-amber-600', ring: 'ring-amber-100' },
  red: { iconBg: 'bg-red-50 text-red-600', ring: 'ring-red-100' },
  slate: { iconBg: 'bg-slate-100 text-slate-600', ring: 'ring-slate-100' },
};

export function StatCard({ label, value, icon: Icon, accent, sub, index = 0 }: StatCardProps) {
  const a = accents[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm shadow-slate-200/40 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${a.iconBg} ring-4 ${a.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
