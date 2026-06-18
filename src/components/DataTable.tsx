import { useMemo, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyText?: string;
  toolbar?: ReactNode;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ columns, rows, searchKeys, searchPlaceholder = 'Cari...', pageSize = 8, emptyText = 'Tidak ada data', toolbar, rowKey }: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue ? col.sortValue(a) : String((a as Record<string, unknown>)[sortKey] ?? '');
      const bv = col.sortValue ? col.sortValue(b) : String((b as Record<string, unknown>)[sortKey] ?? '');
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const alignCls = (a?: string) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-200/40 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between px-4 py-3 border-b border-slate-100">
        {searchKeys ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        ) : <div />}
        {toolbar && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{toolbar}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 sticky top-0">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap ${alignCls(c.align)}`}>
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors">
                    {c.label}
                    {sortKey === c.key ? (
                      sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">{emptyText}</td></tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-blue-50/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-slate-700 ${alignCls(c.align)} ${c.className ?? ''}`}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
          <p className="text-slate-500 text-xs">
            Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} dari {sorted.length} data
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-xs font-medium text-slate-600">{currentPage} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
