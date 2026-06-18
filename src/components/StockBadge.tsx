import { statusColor, statusLabel } from '../lib/utils';
import type { StockStatus } from '../lib/types';

export function StockBadge({ status }: { status: StockStatus }) {
  const c = statusColor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {statusLabel(status)}
    </span>
  );
}
