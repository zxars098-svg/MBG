import { type ReactNode } from 'react';
import { Printer, FileText, FileSpreadsheet } from 'lucide-react';

interface ReportToolbarProps {
  children?: ReactNode;
  onPrint: () => void;
  onPDF: () => void;
  onExcel: () => void;
  orientation?: 'portrait' | 'landscape';
}

export function ReportToolbar({ children, onPrint, onPDF, onExcel }: ReportToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-5">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">{children}</div>
      <div className="flex items-center gap-2">
        <button onClick={onPrint} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <Printer className="h-4 w-4" /> Print
        </button>
        <button onClick={onPDF} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors">
          <FileText className="h-4 w-4" /> PDF
        </button>
        <button onClick={onExcel} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-sm font-medium transition-colors">
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </button>
      </div>
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string | number; onChange: (v: string) => void; options: { value: string | number; label: string }[] }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-500 block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white min-w-[140px]">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function FilterDate({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-500 block mb-1">{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
    </div>
  );
}
